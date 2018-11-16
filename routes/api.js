/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb');
const ObjectID = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  let db;
  MongoClient.connect(CONNECTION_STRING, function(err, _db) {
    if (err) {
      console.error(err) 
      return
    }
    db = _db.db("eoskin-library")
  })

  app.route('/api/books')
    .get(async (req, res) => {
      try {
        const cursor = await db.collection('books').find()
        const data = await cursor.toArray()
        res.json(data.map(({ comments, ...i }) => ({ ...i, commentcount: comments.length })))
      } catch(err) {
        res.status(400)
          .type('text')
          .send('fail');
      } 
    })
    
    .post((req, res) => {
      const { title } = req.body;
          

        const { insertedId: _id } = await db.collection('books').insertOne({ title, comments: [] })
        const obj = await db.collection('books').findOne({ _id: new ObjectID(_id) })
        res.json(obj)
      } catch (err) {
        res.status(400)
          .type('text')
          .send('fail');
      }
    })
    
    .delete((req, res) => {
      safe(res)(async () => {
        await db.collection.deleteMany()
        res.text('complete delete successful')
      })
    });



  app.route('/api/books/:id')
    .get((req, res) => {
      const {id} = req.params;
      safe(res)(async () => {
        const obj = await db.collection('books').findOne({ _id: new ObjectID(id) })
        res.json(obj)
      })
    })
    
    .post((req, res) => {
      const { id } = req.params;
      const { comment } = req.body;
      safe(res)( async () => {
        const { value: obj } = await db.collection('books').findOneAndUpdate(
          { _id: new ObjectID(id) },
          { $push: { comments: comment } },
          { returnNewDocument: true }
        )
        res.json(obj)
      })
    })
    .delete((req, res) => {
      const { id } = req.params;
      safe(res)(async () => {
        const { value: obj } = await db.collection('books').deleteOne(
          { _id: new ObjectID(id) },
        )
        res.text('delete successful')
      })
    });
  
  const safe = res => async (exec) => {
    try {
      await exec()
    } catch (err) {
      res.status(400)
        .type('text')
        .send('fail');
    }
  }
  
};

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
        res.json(data)
      } catch(err) {
        res.status(400)
          .type('text')
          .send('fail');
      } 
    })
    
    .post(async (req, res) => {
      const { title } = req.body;
      try {
        const { insertedId: _id } = await db.collection('books').insertOne({ title, commentcount: 0 })
        const obj = await db.collection('books').findOne({ _id: new ObjectID(_id) })
        res.json(obj)
      } catch (err) {
        res.status(400)
          .type('text')
          .send('fail');
      }
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
  
};

const express = require('express');
const app = express();

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
let mongodb;

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    mongodb = db.db("localhost");

});

app.get('/', function (req, res) {
    mongodb.collection("test"). find({}).toArray(function(err, result) { // 返回集合中所有数据
        if (err) throw err;
        console.log(result);
        res.send(result);
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

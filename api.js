const express = require('express');
const _ = require('lodash');
const app = express();
const bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

let mongodb;
let dataQuyu, dataTrack8, dataTrack12;
let dataShip, dataPlane, dataDD;
let timeIndexDataTrack12;
let allConflictCodes8, allConflictCodes12;
let allConflictCodes8Time, allConflictCodes12Time;
let timeConflictCodes8, timeConflictCodes12;
let data, timeIndexData, allConflictCodes, allBarriers;

function pagination(pageNo, pageSize, array) {
    let offset = (pageNo - 1) * pageSize;
    return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
}

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    mongodb = db.db("localhost");
    console.log('Done');
});


/**
 * @description test.
 */
app.get('/', function (req, res) {
    res.send('holy g3is!');
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
app.use(bodyParser.json());


/**
 * @description API 1
 */
app.post('/get_quyu', function (req, res) {
    try {
        console.log('get_quyu');
        let pageNum = parseInt(req.body.pageNum);
        let pageSize = parseInt(req.body.pageSize);
        mongodb.collection("quyu").find({}).limit(pageSize).skip(pageSize * (pageNum - 1)).toArray(function (err, result) {
            res.send({result: result});
        });
    }
    catch (e) {
        console.error(e);
    }


});

app.post('/get_all_quyu', function (req, res) {
    try {
        console.log('get_all_quyu');
        mongodb.collection("quyu").find({}).toArray(function (err, result) {
            res.send({result: result});
        });
    }
    catch (e) {
        console.error(e);
    }
});

/**
 * @description API 2
 */
app.post('/get_all_track_8', function (req, res) {
    try {
        console.log('get_all_track_8');
        let pageNum = parseInt(req.body.pageNum);
        let pageSize = parseInt(req.body.pageSize);
        mongodb.collection("track_layer_8").find({}).limit(pageSize).skip(pageSize * (pageNum - 1))
            .toArray(function (err, result) {
            res.send({result: result});
        });
    }
    catch (e) {
        console.error(e);
    }
});

/**
 * @description API 3
 */
app.post('/get_object_info', function (req, res) {
    try {
        console.log('get_object_info');
        let type = req.body.type;
        let id = req.body.ID;
        console.log('type:' + type);
        console.log('id:' + id);
        // ship
        if (type === '1'|| type === 1) {
            console.log('get ship');
            mongodb.collection('ship').find({ID: id}).toArray(function (err, result) {
                if(err){
                    res.send(err);
                }
                res.send({result: result, type: type});
            });
        }
        // plane
        else if (type === '2' || type === 2) {
            console.log('get plane');
            mongodb.collection('plane').find({ID: id}).toArray(function (err, result) {
                if(err){
                    res.send(err);
                }
                res.send({result: result, type: type});
            });
        }
        // DD
        else if (type === '3' || type === 3) {
            console.log('get DD');
            mongodb.collection('DD').find({ID: id}).toArray(function (err, result) {
                if(err){
                    res.send(err);
                }
                res.send({result: result, type: type});
            });
        }
    }
    catch (e) {
        res.send({error:e.toString()});
        console.log(e);
    }
});

/**
 * @description API 4
 */
app.post('/get_track_point_time', function (req, res) {
    try {
        console.log('get_track_point_time');
        let pageNum = parseInt(req.body.pageNum);
        let pageSize = parseInt(req.body.pageSize);
        mongodb.collection("track_layer_12").find({}).limit(pageSize).skip(pageSize * (pageNum - 1))
            .toArray(function (err, result) {
                res.send({result: result});
            });
    }
    catch (e) {
        console.error(e);
    }
});

/**
 * @description API 5
 */
app.post('/get_track_point_time_id', function (req, res) {
    console.log('get_track_point_time_id');
    let time = parseInt(req.body.time);
    let id = req.body.id;
    let track = allBarriers[id][time];
    res.send({result: track});
});

/**
 * @description API 6
 */
app.post('/get_conflict_codes', function (req, res) {
    console.log('get_conflict_codes');
    let level = parseInt(req.body.level);
    if (level === 8) {
        console.log(allConflictCodes8.length);
        res.send({result: allConflictCodes8});
    }
    else if (level === 12) {
        console.log(allConflictCodes12.length);
        res.send({result: allConflictCodes12});
    }
});

/**
 * @description API 7
 */
app.post('/get_conflict_codes_time', function (req, res) {
    console.log('get_conflict_codes_time');
    let level = parseInt(req.body.level);
    let time = parseInt(req.body.time);
    if (level === 8) {
        res.send({result: timeConflictCodes8[time]});
    }
    else if (level === 12) {
        res.send({result: timeConflictCodes12[time]});
    }
});


app.listen(3001, function () {
    console.log('Example app listening on port 3001!');
});

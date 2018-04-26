const express = require('express');
const app = express();

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

let mongodb;
let data,timeIndexData,allConflictCodes,allBarriers;

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    mongodb = db.db("localhost");
    timeIndexData = {};
    allBarriers = {};
    allConflictCodes = [];
    mongodb.collection("test2"). find({}).toArray(function(err, result) {
        if (err) throw err;

        data = result;
        data.forEach((item, i) => {
            // console.log(item);
            if(item['data_exist']){
                let time_data_items = item['data'];
                let conflict = false;
                time_data_items.forEach((time_item, t_i) =>{
                    let time = time_item['time'];
                    let barrierId = time_item['dataid'];
                    if(time_item['conflict'])
                        conflict = true;
                    if(!timeIndexData[time]){
                        timeIndexData[time] = [];
                    }
                    timeIndexData[time].push(time_item);
                    if(!allBarriers[barrierId]){
                        allBarriers[barrierId] = {};
                    }
                    allBarriers[barrierId][time] = time_item;
                });
                if(conflict){
                    allConflictCodes.push(item['_id']);
                }
            }
        });
    });
});

/**
 * @description test.
 */
app.get('/', function (req, res) {
    res.send('holy g3is!');
});

/**
 * @example http://127.0.0.1:3000/get_all_conflict_codes
 * @return JSON array.
 */
app.get('/get_all_conflict_codes',function (req, res) {
    console.log('get_all_conflict_codes');
    res.send(allConflictCodes);
});

/**
 * @param req.query.time int
 * @example http://127.0.0.1:3000/get_current_data?time=55
 * @return JSON array.
 */
app.get('/get_current_data',function (req, res) {
    let queryTime = req.query.time;
    console.log('get_current_data',queryTime);
    res.send(timeIndexData[queryTime]);
});

/**
 * @param req.query.dataid int
 * @param req.query.time int
 * @example http://127.0.0.1:3000/get_barrier_info?dataid=8&time=6197
 * @return JSON object.
 */
app.get('/get_barrier_info',function (req, res) {
    let dataId = req.query.dataid;
    let queryTime = req.query.time;
    console.log('get_barrier_info',dataId, queryTime);
    res.send(allBarriers[dataId][queryTime]);
});

/**
 * @example http://127.0.0.1:3000/get_all_infos
 * @return JSON array.
 */
app.get('/get_all_infos',function (req, res) {
    console.log('get_all_infos');
    res.send(data);
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

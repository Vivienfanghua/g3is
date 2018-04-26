const express = require('express');
const _ = require('lodash');
const app = express();
const bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

let mongodb;
let data,timeIndexData,allConflictCodes,allBarriers;

function pagination(pageNo, pageSize, array) {
    let offset = (pageNo - 1) * pageSize;
    return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
}

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    mongodb = db.db("localhost");
    timeIndexData = {};
    allBarriers = {};
    allConflictCodes = [];
    mongodb.collection("test2"). find({}).toArray(function(err, result) {
        if (err) throw err;

        data = result;
        let array = pagination(0,20,data);
        let pageNum = 20;
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

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


/**
 * @example http://127.0.0.1:3000/get_all_conflict_codes
 * @return JSON array.
 */
app.get('/get_all_conflict_codes',function (req, res) {
    console.log('get_all_conflict_codes');
    res.send({result:allConflictCodes});
});

/**
 * @param req.query.time int
 * @example http://127.0.0.1:3000/get_current_data?time=55
 * @return JSON array.
 */
app.get('/get_current_data',function (req, res) {
    let queryTime = req.query.time;
    console.log('get_current_data',queryTime);
    res.send({result:timeIndexData[queryTime]});
});

/**
 * @param req.body.time int
 * @example http://127.0.0.1:3000/get_current_data?time=55
 * @return JSON array.
 */
app.post('/get_current_data',function (req, res) {
    let queryTime = req.body.time;
    console.log('get_current_data',queryTime);
    res.send({result:timeIndexData[queryTime]});
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
 * @param req.body.dataid int
 * @param req.query.time int
 * @example http://127.0.0.1:3000/get_barrier_info
 * @return JSON object.
 */
app.post('/get_barrier_info',function (req, res) {
    //let params = _.pick(JSON.parse(decodeURIComponent(req.body.data)), 'dataid', 'time');
    let dataId = req.body.dataid;
    let queryTime = req.body.time;
    console.log('get_barrier_info',dataId, queryTime);
    res.send(allBarriers[dataId][queryTime]);
});

/**
 * @param req.query.pageNum int
 * @param req.query.pageSize int
 * @example http://127.0.0.1:3000/get_all_infos
 * @return JSON array.
 */
app.get('/get_all_infos',function (req, res) {
    console.log('get_all_infos');
    let pageNum = parseInt(req.query.pageNum);
    let pageSize = parseInt(req.query.pageSize);
    let partition = pagination(pageNum,pageSize,data);
    res.send({result:partition});
});


/**
 * @param req.query.pageNum int
 * @param req.query.pageSize int
 * @example http://127.0.0.1:3000/get_all_infos
 * @return JSON array.
 */
app.post('/get_all_infos',function (req, res) {
    console.log('get_all_infos');
    let pageNum = parseInt(req.body.pageNum);
    let pageSize = parseInt(req.body.pageSize);
    let partition = pagination(pageNum,pageSize,data);
    res.send({result:partition});
});


app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

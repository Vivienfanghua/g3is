const express = require('express');
const _ = require('lodash');
const app = express();
const bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

let mongodb;
let dataQuyu, dataTrack8, dataTrack12, dataTrack10;
let dataShip, dataPlane, dataDD;
let timeIndexDataTrack12, timeIndexDataTrack10;
let allConflictCodes8, allConflictCodes12, allConflictCodes10;
let allConflictCodes8Time, allConflictCodes12Time, allConflictCodes10Time;
let timeConflictCodes8, timeConflictCodes12, timeConflictCodes10;
let data, timeIndexData12, timeIndexData10, allConflictCodes, allBarriers12, allBarriers10;
let allCodes8;
let allTrackData;

function pagination(pageNo, pageSize, array) {
    let offset = (pageNo - 1) * pageSize;
    return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
}

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    mongodb = db.db("localhost");
    timeIndexData12 = {};
    allBarriers12 = {};
    allBarriers10 = {};

    allConflictCodes = [];

    timeIndexDataTrack12 = {};
    timeIndexDataTrack10 = {};

    allConflictCodes8 = [];
    allConflictCodes12 = [];
    allConflictCodes10 = [];

    allConflictCodes8Time = {};
    allConflictCodes12Time = {};
    allConflictCodes10Time = {};

    timeConflictCodes8 = {};
    timeConflictCodes12 = {};
    timeConflictCodes10 = {};
    allCodes8 = [];

    allTrackData = {};

    mongodb.collection("quyu").find({}).toArray(function (err, result) {
        dataQuyu = result;
    });
    mongodb.collection("track_layer_8").find({}).toArray(function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        dataTrack8 = result;

        dataTrack8.forEach((item, i) => {
            allCodes8.push(item['_id']);
            // console.log(item);
            if (item['data_exist']) {
                let time_data_items = item['data'];
                let code = item['_id'];
                let conflict = false;
                time_data_items.forEach((time_item, t_i) => {
                    let currentTime = Math.floor(time_item['time']);
                    time_item['code'] = code;

                    if (time_item['conflict']) {
                        if (!timeConflictCodes8[currentTime])
                            timeConflictCodes8[currentTime] = [];
                        timeConflictCodes8[currentTime].push(code);
                        conflict = true;
                    }

                });
                if (conflict) {
                    allConflictCodes8.push(item['_id']);
                }
            }
        });
        console.log(allConflictCodes8.length);
    });
    // mongodb.collection("track_layer_12").find({}).toArray(function (err,result) {
    //     if(err) {
    //         console.log(err);
    //         return;
    //     }
    //     dataTrack12 = result;
    //
    //     dataTrack12.forEach((item, i) => {
    //         // console.log(item);
    //         if(item['data_exist']){
    //             let time_data_items = item['data'];
    //             let conflict = false;
    //             let code = item['_id'];
    //             time_data_items.forEach((time_item, t_i) =>{
    //                 time_item['code'] = code;
    //                 let time = Math.floor(time_item['time']);
    //                 let barrierId = time_item['ID'];
    //                 if(time_item['conflict']){
    //                     if(!timeConflictCodes12[time])
    //                         timeConflictCodes12[time] = [];
    //                     timeConflictCodes12[time].push(code);
    //                     conflict = true;
    //                 }
    //                 if(!timeIndexDataTrack12[time]){
    //                     timeIndexDataTrack12[time] = [];
    //                 }
    //                 timeIndexDataTrack12[time].push(time_item);
    //                 if(!allBarriers12[barrierId]){
    //                     allBarriers12[barrierId] = {};
    //                 }
    //                 allBarriers12[barrierId][time] = time_item;
    //             });
    //             if(conflict){
    //                 allConflictCodes12.push(item['_id']);
    //             }
    //         }
    //     });
    // });
    mongodb.collection("track_layer_10").find({}).toArray(function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        dataTrack10 = result;

        dataTrack10.forEach((item, i) => {
            // console.log(item);
            if (item['data_exist']) {
                let time_data_items = item['data'];
                let conflict = false;
                let code = item['_id'];
                time_data_items.forEach((time_item, t_i) => {
                    time_item['code'] = code;
                    let trackId = time_item['trackid'];
                    let time = Math.floor(time_item['time']);
                    let barrierId = time_item['ID'];
                    if (time_item['conflict']) {
                        if (!timeConflictCodes10[time])
                            timeConflictCodes10[time] = [];
                        timeConflictCodes10[time].push(code);
                        conflict = true;
                    }
                    if (!timeIndexDataTrack10[time]) {
                        timeIndexDataTrack10[time] = [];
                    }
                    timeIndexDataTrack10[time].push(time_item);
                    if (!allBarriers10[barrierId]) {
                        allBarriers10[barrierId] = {};
                    }
                    allBarriers10[barrierId][time] = time_item;
                    // TODO full info of track @Qi
                    allTrackData[trackId] = {
                        id: barrierId,
                        track_id: trackId,
                        type: time_item['type'],
                        L: time_item['L'],
                        B: time_item['B'],
                        H: time_item['H']
                    }
                });
                if (conflict) {
                    allConflictCodes10.push(item['_id']);
                }
            }
        });
    });
    mongodb.collection("ship").find({}).toArray(function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        dataShip = {};
        result.forEach((item, t_i) => {
            dataShip[item['ID']] = item;
        });
    });
    mongodb.collection("plane").find({}).toArray(function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        dataPlane = {};
        result.forEach((item, t_i) => {
            dataPlane[item['ID']] = item;
        });
    });
    mongodb.collection("DD").find({}).toArray(function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        dataDD = {};
        result.forEach((item, t_i) => {
            dataDD[item['ID']] = item;
        });
    });
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
 * @example http://127.0.0.1:3000/get_all_conflict_codes
 * @return JSON array.
 */
app.get('/get_all_conflict_codes', function (req, res) {
    console.log('get_all_conflict_codes');
    res.send({result: allConflictCodes});
});

/**
 * @param req.query.time int
 * @example http://127.0.0.1:3000/get_current_data?time=55
 * @return JSON array.
 */
app.get('/get_current_data', function (req, res) {
    let queryTime = req.query.time;

    console.log('get_current_data', queryTime);
    res.send({result: timeIndexData12[queryTime]});

});

/**
 * @param req.body.time int
 * @example http://127.0.0.1:3000/get_current_data?time=55
 * @return JSON array.
 */
app.post('/get_current_data', function (req, res) {
    let queryTime = req.body.time;
    let level = parseInt(req.body.level);
    console.log('get_current_data', queryTime);
    console.log('get_current_data', level);
    if (level === 12)
        res.send({result: timeIndexData12[queryTime]});
    if (level === 10)
        res.send({result: timeIndexData10[queryTime]});
});

/**
 * @param req.query.dataid int
 * @param req.query.time int
 * @example http://127.0.0.1:3000/get_barrier_info?dataid=8&time=6197
 * @return JSON object.
 */
app.get('/get_barrier_info', function (req, res) {
    let dataId = req.query.dataid;
    let queryTime = req.query.time;
    console.log('get_barrier_info', dataId, queryTime);
    res.send(allBarriers12[dataId][queryTime]);
});

/**
 * @param req.body.dataid int
 * @param req.query.time int
 * @example http://127.0.0.1:3000/get_barrier_info
 * @return JSON object.
 */
app.post('/get_barrier_info', function (req, res) {
    //let params = _.pick(JSON.parse(decodeURIComponent(req.body.data)), 'dataid', 'time');
    let dataId = req.body.dataid;
    let queryTime = req.body.time;
    console.log('get_barrier_info', dataId, queryTime);
    res.send(allBarriers12[dataId][queryTime]);
});

/**
 * @param req.query.pageNum int
 * @param req.query.pageSize int
 * @example http://127.0.0.1:3000/get_all_infos
 * @return JSON array.
 */
app.get('/get_all_infos', function (req, res) {
    console.log('get_all_infos');
    let pageNum = parseInt(req.query.pageNum);
    let pageSize = parseInt(req.query.pageSize);
    let partition = pagination(pageNum, pageSize, data);
    res.send({result: partition});
});

app.get('/get_all_all', function (req, res) {
    console.log('get_all_all');
    res.send({result: data});
});


/**
 * @param req.query.pageNum int
 * @param req.query.pageSize int
 * @example http://127.0.0.1:3000/get_all_infos
 * @return JSON array.
 */
app.post('/get_all_infos', function (req, res) {
    console.log('get_all_infos');
    let pageNum = parseInt(req.body.pageNum);
    let pageSize = parseInt(req.body.pageSize);
    let partition = pagination(pageNum, pageSize, data);
    res.send({result: partition});
});

app.post('/get_first_page', function (req, res) {
    console.log('get_first_page');
    let pageSize = parseInt(req.body.pageSize);
    // console.log(partition);
    res.send({result: data.slice(0, pageSize)});
});

/**
 * @description API 1
 */
app.post('/get_quyu', function (req, res) {
    console.log('get_quyu');
    let pageNum = parseInt(req.body.pageNum);
    let pageSize = parseInt(req.body.pageSize);
    let partition = pagination(pageNum, pageSize, dataQuyu);
    res.send({result: partition});
});

app.post('/get_all_quyu', function (req, res) {
    console.log('get_all_quyu');
    res.send({result: dataQuyu});
});

/**
 * @description API 2
 */
app.post('/get_all_track_8', function (req, res) {
    console.log('get_all_track_8');
    let pageNum = parseInt(req.body.pageNum);
    let pageSize = parseInt(req.body.pageSize);
    console.log('req.body.pageNum:' + req.body.pageNum);
    console.log('req.body.pageSize:' + req.body.pageSize);
    let partition = pagination(pageNum, pageSize, dataTrack8);
    console.log("partition.length:" + partition.length);

    res.send({result: partition});
});

/**
 * @description API 3
 */
app.post('/get_object_info', function (req, res) {
    console.log('get_object_info');
    let type = req.body.type;
    let id = req.body.ID;
    console.log('type:' + type);
    console.log('id:' + id);
    // ship
    if (type === 1) {
        console.log(type);
        res.send({result: dataShip[id], type: type});
    }
    // plane
    else if (type === 2) {
        console.log(type);
        res.send({result: dataPlane[id], type: type});
    }
    // DD
    else if (type === 3) {
        console.log(type);
        res.send({result: dataDD[id], type: type});
    }
});

/**
 * @description API 4
 */
app.post('/get_track_point_time', function (req, res) {
    console.log('get_track_point_time');
    let time = parseInt(req.body.time);

    let pageNum = parseInt(req.body.pageNum);
    let pageSize = parseInt(req.body.pageSize);
    let level = parseInt(req.body.level);
    console.log(time);
    if (level === 12) {
        let timeData = timeIndexDataTrack12[time];

        console.log('time:' + req.body.time);
        console.log('pageNum:' + req.body.pageNum);
        console.log('pageSize:' + req.body.pageSize);
        let partition = pagination(pageNum, pageSize, timeData);
        res.send({result: partition});
    }
    if (level === 10) {
        let timeData = timeIndexDataTrack10[time];

        console.log('time:' + req.body.time);
        console.log('pageNum:' + req.body.pageNum);
        console.log('pageSize:' + req.body.pageSize);
        let partition = pagination(pageNum, pageSize, timeData);
        res.send({result: partition});
    }
});

/**
 * @description API 5
 */
app.post('/get_track_point_time_id', function (req, res) {
    console.log('get_track_point_time_id');
    let time = parseInt(req.body.time);
    let id = req.body.id;
    let level = parseInt(req.body.level);
    if (level === 12) {
        let track = allBarriers12[id][time];
        res.send({result: track});
    }
    if (level === 10) {
        let track = allBarriers10[id][time];
        res.send({result: track});
    }
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
    else if (level === 10) {
        console.log(allConflictCodes10.length);
        res.send({result: allConflictCodes10});
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            else if (level === 10) {
        res.send({result: timeConflictCodes10[time]});
    }
});

/**
 * @description API 8
 */
app.post('/get_all_codes_8', function (req, res) {
    console.log('get_all_codes_8');
    res.send({result: allCodes8});
});

/**
 * @description API 9
 */
app.post('/get_all_track_id', function (req, res) {
    console.log('get_all_track_id');
    let values = [];
    for(i in allTrackData){
        values.push(allTrackData[i]);
    }
    res.send({result: values});

});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

const express = require('express');
const app = express();
const log4js = require('log4js');
const bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

let logger = log4js.getLogger();
logger.level = 'debug';

let mongodb;

let quyuTableNames = {
    10: 'quyu_10',
    11: 'quyu_11',
    12: 'quyu_12',
    13: 'quyu_13',
    14: 'quyu_14',
    15: 'quyu_15'
};
let trackTableNames = {
    8: 'track_8',
    9: 'track_9',
    10: 'track_10',
    11: 'track_11',
    12: 'track_12',
    13: 'track_13',
    14: 'track_14',
    15: 'track_15',
};

let paramTableNames = {
    'dd': 'param_dd',
    'plane': 'param_plane',
    'ship': 'param_ship'
};

function pagination(pageNo, pageSize, array) {
    let offset = (pageNo - 1) * pageSize;
    return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
}

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    mongodb = db.db("localhost");
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

        let pageNum = parseInt(req.body.pageNum);
        let pageSize = parseInt(req.body.pageSize);
        let level = parseInt(req.body.level);
        logger.info('get_quyu', 'pageNum', pageNum, 'pageSize', pageSize, 'level', level);

        mongodb.collection(quyuTableNames[level]).find({}).limit(pageSize).skip(pageSize * (pageNum - 1)).toArray(function (err, result) {
            res.send({result: result});
            logger.warn('get_quyu', 'result length', result.length);
        });
    }
    catch (e) {
        logger.error(e);
    }


});
/**
 * @description API 2
 * 返回所有的网格码
 *
 */
app.post('/get_all_quyu', function (req, res) {
    try {
        logger.info('get_all_quyu');
        let level = parseInt(req.body.level);
        mongodb.collection(quyuTableNames[level]).find({}).toArray(function (err, result) {
            res.send({result: result});
            logger.warn('get_all_quyu', 'result length', result.length);
        });
    }
    catch (e) {
        logger.error(e);
    }
});

/**
 * @description API 3
 * 返回所有的轨迹
 *
 */
app.post('/get_all_track', function (req, res) {
    try {

        let pageNum = parseInt(req.body.pageNum);
        let pageSize = parseInt(req.body.pageSize);
        let level = parseInt(req.body.level);
        let collectionName = trackTableNames[level];
        logger.info('get_all_track', 'pageNum', pageNum, 'pageSize', pageSize, 'level', level);

        mongodb.collection(collectionName).find({"data_exist": 1}, {
            fields: {
                "_id": 1,
                "data.L": 1,
                "data.B": 1,
                "data.H": 1,
                "data.ID": 1,
                "data.conflict": 1,
                "data.trackid": 1,
                "data.type": 1
            }
        }).limit(pageSize).skip(pageSize * (pageNum - 1)).toArray(function (err, result) {
            res.send({'result': result});
            logger.warn('get_all_track', 'result length', result.length);
        });

    }
    catch (e) {
        logger.error(e);
    }
});

/**
 * @description API 4
 */
app.post('/get_object_info', function (req, res) {
    try {
        let type = req.body.type;  // dd, plane, ship
        let id = req.body.ID;
        let collectionName = paramTableNames[type];
        logger.info('get_object_info', 'type', type, 'id', id);

        mongodb.collection(collectionName).find({ID: id}).toArray(function (err, result) {
            if (err) {
                res.send(err);
            }
            res.send({result: result, type: type});
            logger.info('get_object_info', 'result length', result.length);
        });
    }
    catch (e) {
        res.send({error: e.toString()});
        logger.error(e);
    }
});

/**
 * @description API 5
 * 返回当前时刻的编码
 */
app.post('/get_track_point_time', function (req, res) {
    try {

        let pageNum = parseInt(req.body.pageNum);
        let pageSize = parseInt(req.body.pageSize);
        let level = parseInt(req.body.level);
        let time = parseInt(req.body.time);
        let collectionName = trackTableNames[level];
        logger.info('get_track_point_time', 'pageNum', pageNum, 'pageSize', pageSize, 'level', level, 'time', time);
        mongodb.collection(collectionName).aggregate([{$match: {"data.time": time}}, {
            $project: {
                "_id": 1,
                "data": {
                    "$filter": {
                        input: "$data",
                        as: "v",
                        cond: {$eq: ["$$v.time", time]},
                    }
                }
            }
        }, {$unwind: "$data"}
        ]).limit(pageSize).skip(pageSize * pageNum - pageSize).toArray(function (err, result) {
            if (err) {
                logger.error(err);
            }
            res.send({'result': result});
            logger.warn('get_track_point_time', 'result length', result.length);
        });

    }
    catch (e) {
        logger.error(e);
    }
});

/**
 * @description API 5.5
 */
app.post('/get_track_codes_time', function (req, res) {
    try {
        let level = parseInt(req.body.level);
        let time = parseInt(req.body.time);
        let collectionName = trackTableNames[level];
        logger.info('get_track_codes_time', 'level', level, 'time', time);

        mongodb.collection(collectionName).aggregate([{$match: {"data.time": time}}, {
            $project: {
                "_id": 1
            }
        }]).toArray(function (err, result) {
            res.send({'result': result});
            logger.warn('get_track_codes_time', 'result length', result.length);
        });
    }
    catch (e) {
        logger.error(e);
    }
});
/**
 * @description API 6
 * 返回当前时刻 trackid的编码
 */
app.post('/get_track_point_time_id', function (req, res) {
    try {
        let time = parseInt(req.body.time);
        let id = req.body.id; // track id
        let level = parseInt(req.body.level);
        let collectionName = trackTableNames[level];
        logger.info('get_track_point_time_id', 'level', level, 'time', time, 'id', id);

        mongodb.collection(collectionName).aggregate([{$match: {"data.time": time, "data.trackid": id}}, {
            $project: {
                "_id": 1,
                "data": {
                    "$filter": {
                        input: "$data",
                        as: "v",
                        cond: {$eq: ["$$v.time", time]},
                    }
                }
            }
        }, {$unwind: "$data"}
        ]).toArray(function (err, result) {
            res.send({'result': result});
            logger.warn('get_track_point_time_id', 'result length', result.length);
        });
    }
    catch (e) {
        logger.error(e);
    }
});

/**
 * @description API 7
 * 只返回了所有冲突code
 */
app.post('/get_conflict_codes', function (req, res) {
    try {
        let level = parseInt(req.body.level);
        let collectionName = trackTableNames[level];
        logger.info('get_conflict_codes', 'level', level);
        mongodb.collection(collectionName).aggregate([{$match: {"data.conflict": 1}}, {
            $project: {
                "_id": 1
            }
        }]).toArray(function (err, results) {
            res.send({'result': results});
            logger.warn('get_conflict_codes', 'level', level);
        });
    }
    catch (e) {
        console.error(e);
    }
});


/**
 * @description API 8
 * *返回了time时刻冲突code
 */
app.post('/get_conflict_codes_time', function (req, res) {
    try {
        let level = parseInt(req.body.level);
        let time = parseInt(req.body.time);
        let collectionName = trackTableNames[level];
        logger.info('get_conflict_codes_time', 'level', level, 'time', time);
        mongodb.collection(collectionName).aggregate([{
            $match: {
                "data.conflict": 1,
                "data.time": time
            }
        }, {
            $project: {
                "_id": 1
            }
        }]).toArray(function (err, results) {
            res.send({'result': results});
            logger.warn('get_conflict_codes_time', 'level', level);
        });
    }
    catch (e) {
        console.error(e);
    }
});

/**
 * @description API 9
 * 只返回了track id 的某一个位置数据
 * TODO 什么意思？
 */
app.post('/get_track_one_position', function (req, res) {
    try {

        let level = parseInt(req.body.level);
        let trackid = req.body.trackid;
        let collectionName = trackTableNames[level];

        logger.info('get_track_one_position', 'level', level, 'trackid', trackid);

        // mongodb.collection(collectionName).aggregate([{
        //     $match: {
        //         "data.trackid": trackid,
        //     }}]).toArray(function (err, results) {
        //     res.send({'result': results});
        //     logger.warn('get_track_one_position', 'level', level);
        // });

        mongodb.collection(collectionName).findOne({"data.trackid": trackid}, function (err, result) {
            res.send({'result': result});
            logger.warn('get_track_one_position', 'result length', result.length)
        });
    }
    catch (e) {
        logger.error(e);
    }

});

/**
 * @description API 10
 * 只返回了所有的轨迹点的code
 */
app.post('/get_codes', function (req, res) {
    try {
        let level = parseInt(req.body.level);
        let collectionName = trackTableNames[level];

        logger.info('get_codes', 'level', level);

        mongodb.collection(collectionName).distinct("_id", function (err, results) {
            res.send({'result': results});
            logger.debug('get_codes', 'result length', results.length);
        });
    }
    catch (e) {
        logger.error(e);
    }
});


/**
 * @description API 11
 * 临时添加返回所有的trackid和信息
 */

// app.post('/get_all_trackid', function (req, res) {
//     try {
//
//         let level = parseInt(req.body.level);
//         let collectionName = trackTableNames[level];
//
//
//         res.send({'result': trackIdArray});
//         logger.log('get_all_trackid', 'result length', trackIdArray.length);
//
//     }
//     catch (e) {
//         logger.error(e);
//     }
// });

app.listen(3001, function () {
    logger.debug('Example app listening on port 3001!');
});

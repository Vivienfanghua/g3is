const express = require('express');
const app = express();
const log4js = require('log4js');
const bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

let logger = log4js.getLogger();
logger.level = 'debug';

let mongodb;
let trackIdArray;

function pagination(pageNo, pageSize, array) {
    let offset = (pageNo - 1) * pageSize;
    return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
}

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    mongodb = db.db("localhost");

    trackIdArray = [];

    let collectionName = "track_layer8_view";

    mongodb.collection(collectionName).distinct("data.trackid", function (err, results) {
        for (let item in results) {
            //console.log(results[item]);
            mongodb.collection(collectionName).find({"data.trackid": results[item]}, {
                fields: {
                    "data.trackid": 1,
                    "data.L": 1,
                    "data.B": 1,
                    "data.H": 1,
                    "data.ID": 1,
                    "data.type": 1
                }
            }).limit(1).toArray(function (err, aa) {
                trackIdArray.push(aa[0]['data']);
            });
        }
        logger.info('Load Data Done');
    });
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
        logger.info('get_quyu', 'pageNum', pageNum, 'pageSize', pageSize);
        mongodb.collection("quyu").find({}).limit(pageSize).skip(pageSize * (pageNum - 1)).toArray(function (err, result) {
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
        mongodb.collection("quyu").find({}).toArray(function (err, result) {
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
        let collectionName = "track_layer_8";
        if (level === 12)
            collectionName = "track_layer_12";
        if (level === 10)
            collectionName = "track_layer_10";
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
 *
 */
app.post('/get_object_info', function (req, res) {
    try {
        let type = req.body.type;
        let id = req.body.ID;
        logger.info('get_object_info', 'type', type, 'id', id);
        // ship
        if (type === '1' || type === 1) {
            mongodb.collection('ship').find({ID: id}).toArray(function (err, result) {
                if (err) {
                    res.send(err);
                }
                res.send({result: result, type: type});
                logger.info('get_object_info', 'result length', result.length);
            });
        }
        // plane
        else if (type === '2' || type === 2) {
            mongodb.collection('plane').find({ID: id}).toArray(function (err, result) {
                if (err) {
                    res.send(err);
                }
                res.send({result: result, type: type});
                logger.info('get_object_info', 'result length', result.length);
            });
        }
        // DD
        else if (type === '3' || type === 3) {
            mongodb.collection('DD').find({ID: id}).toArray(function (err, result) {
                if (err) {
                    res.send(err);
                }
                res.send({result: result, type: type});
                logger.info('get_object_info', 'result length', result.length);
            });
        }
    }
    catch (e) {
        res.send({error: e.toString()});
        logger.error(e);
    }
});

/**
 * @description API 5
 * 返回当前时刻的编码
 * TODO refine database query.
 */
app.post('/get_track_point_time', function (req, res) {
    try {

        let pageNum = parseInt(req.body.pageNum);
        let pageSize = parseInt(req.body.pageSize);
        let level = parseInt(req.body.level);
        let time = parseInt(req.body.time);
        let collectionName = "track_layer8_view";
        if (level === 12)
            collectionName = "track_layer12_view";
        if (level === 10)
            collectionName = "track_layer10_view";
        logger.info('get_track_point_time', 'pageNum', pageNum, 'pageSize', pageSize, 'level', level, 'time', time);

        mongodb.collection(collectionName).find({"data.time": time}, {
            fields: {
                "_id": 1,
                "data.time": 1,
                "data.trackid": 1,
                "data.L": 1,
                "data.B": 1,
                "data.H": 1,
                "data.ID": 1,
                "data.type": 1,
                "data.yj": 1,
                "data.hx": 1
            }
        }).limit(pageSize).skip(pageSize * pageNum - pageSize).toArray(function (err, result) {
            res.send({'result': result});
            logger.warn('get_track_point_time','result length',result.length);
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
        let collectionName = "track_layer8_view";
        if (level === 12)
            collectionName = "track_layer12_view";
        if (level === 10)
            collectionName = "track_layer10_view";
        logger.info('get_track_codes_time','level', level, 'time', time);

        mongodb.collection(collectionName).distinct("_id", {"data.time": time}, function (err, results) {
            res.send({'result': results});
            logger.warn('get_track_codes_time','result length', result.length);
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
        let id = req.body.id;
        let level = parseInt(req.body.level);
        logger.info('get_track_point_time_id','level', level, 'time', time,'id',id);
        let collectionName = "track_layer8_view";
        if (level === 12)
            collectionName = "track_layer12_view";
        if (level === 10)
            collectionName = "track_layer10_view";
        mongodb.collection(collectionName).find({
            "data.time": time,
            "data.trackid": id
        }).toArray(function (err, result) {
            res.send({'result': result});
            logger.warn('get_track_point_time_id','result length', result.length);
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
        let collectionName = "track_layer8_view";
        if (level === 12)
            collectionName = "track_layer12_view";
        if (level === 10)
            collectionName = "track_layer10_view";
        logger.info('get_conflict_codes','level', level);
        mongodb.collection(collectionName).distinct("_id", {"data.conflict": 1}, function (err, results) {
            res.send({'result': results});
            logger.warn('get_conflict_codes','level', level);
        });
    }
    catch (e) {
        console.error(e);
    }
});


/**
 * @description API 8
 * *返回了time时刻冲突code
 * TODO refine database query.
 */
app.post('/get_conflict_codes_time', function (req, res) {
    try {
        let level = parseInt(req.body.level);
        let time = parseInt(req.body.time);
        let collectionName = "track_layer8_view";
        if (level === 12)
            collectionName = "track_layer12_view";
        if (level === 10)
            collectionName = "track_layer10_view";
        logger.info('get_conflict_codes_time','level', level,'time',time);
        mongodb.collection(collectionName).distinct("_id", {
            "data.conflict": 1,
            "data.time": time
        }, function (err, results) {

            res.send({'result': results});
            logger.warn('get_conflict_codes_time','result length', results.length);
        });
    }
    catch (e) {
        console.error(e);
    }
});

/**
 * @description API 9
 * 只返回了track id 的某一个位置数据
 */
app.post('/get_track_one_position', function (req, res) {
    try {

        let level = parseInt(req.body.level);
        let trackid = req.body.trackid;

        let collectionName = "track_layer8_view";
        if (level === 12)
            collectionName = "track_layer12_view";
        if (level === 10)
            collectionName = "track_layer10_view";

        logger.info('get_track_one_position','level', level,'trackid',trackid);

        mongodb.collection(collectionName).findOne({"data.trackid": trackid}, function (err, result) {
            res.send({'result': result});
            logger.warn('get_track_one_position','result length', result.length)
        });
    }
    catch (e) {
        logger.error(e);
    }

});

/**
 * @description API 10
 * 只返回了所有的轨迹点的code
 * TODO refine database query.
 */
app.post('/get_codes', function (req, res) {
    try {
        let level = parseInt(req.body.level);

        let collectionName = "track_layer8_view";
        if (level === 8)
            collectionName = "track_layer8_view";
        if (level === 12)
            collectionName = "track_layer12_view";
        if (level === 10)
            collectionName = "track_layer10_view";

        logger.info('get_codes','level', level);

        mongodb.collection(collectionName).distinct("_id", function (err, results) {
            res.send({'result': results});
            logger.debug('get_codes','result length', results.length);
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
app.post('/get_all_trackid', function (req, res) {
    try {
        logger.log('get_all_trackid','level', level);
        res.send({'result': trackIdArray});
        logger.log('get_all_trackid','result length', trackIdArray.length);
    }
    catch (e) {
        logger.error(e);
    }
});

app.listen(3001, function () {
    logger.debug('Example app listening on port 3001!');
});

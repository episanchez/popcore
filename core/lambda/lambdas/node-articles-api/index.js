var mysql = require('mysql');
var async = require("async");


module.exports.handler = function(event, context, cb) {
 console.log(event)
 var pool = mysql.createPool({
 host     : 'popvox-mysql-articles-db.cajp6pxatu6q.eu-west-3.rds.amazonaws.com',
 user     : 'popvox_db_admin',
 password : 'asvBJ{[#',
 database : 'popvox_mysql_db_main',
 multipleStatements: true
 });

    async.waterfall([
        function(callback){
            console.log("querying article")

            pool.getConnection(function(err, connection) {
                if (err) throw err;
                var eb = JSON.parse(event.body);
                connection.query("SELECT * FROM (SELECT * FROM article LEFT JOIN (SELECT pv.article_id FROM page_visited AS pv JOIN user ON user.id = pv.user_id WHERE user.fb_id = ?) AS FP ON article.id = FP.article_id WHERE FP.article_id IS NULL ORDER BY rand() LIMIT 10) T1  ORDER BY published_date LIMIT 1", [eb.nlp.uuid], function (error, results, fields){
                    connection.release();
                    if (error) throw error;
                    callback(null, results[0], eb.nlp.uuid)
                });
            })
        },
        function(article, fb_id, callback){
            console.log("inserting user")
            pool.getConnection(function(err, connection) {
                if (err) throw err;
                connection.query("INSERT INTO user(fb_id) SELECT * FROM (SELECT ?) AS T1 WHERE NOT EXISTS (SELECT fb_id FROM user WHERE fb_id = ?);" , [fb_id, fb_id], function (error, results, fields){
                    connection.release();
                    if (error) throw error;
                    console.log(results);
                    callback(null, article, fb_id)
                });
            })
        },
        function(article, fb_id, callback){
            console.log("inserting page_visited")
            pool.getConnection(function(err, connection) {
                if (err) throw err;
                connection.query("INSERT INTO page_visited(article_id, user_id) SELECT (SELECT ?), (SELECT id FROM user WHERE fb_id = ? LIMIT 1)", [article.id, fb_id], function (error, results, fields){
                    connection.release();
                    if (error) throw error;
                    console.log(results);
                    callback(null, article)
                });
            })
        }
        ], function (err, result) {
            if (err){
                console.log("error")
                cb(null, {
                    statusCode: 404,
                    headers: {},
                    body: JSON.stringify({
                        msg: "article not founded",
                        error: err,
                        event: event
                    })
                })
            }
            else {
                console.log("call callback")
                pool.end();
                cb(null, {
                    statusCode: 200,
                    headers: {},
                    body: JSON.stringify({replies: [{
                        type: "text",
                        content: result.url
                    }]})
                })
            }
    });
};

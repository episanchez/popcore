var mysql = require('mysql');

var connection = mysql.createConnection({
 host     : 'popvox-mysql-articles-db.cajp6pxatu6q.eu-west-3.rds.amazonaws.com',
 user     : 'popvox_db_admin',
 password : 'asvBJ{[#',
 database : 'popvox_mysql_db_main'
 });

function get(cb){
 connection.query("SELECT * FROM (SELECT * FROM article ORDER BY rand() LIMIT 10) T1  ORDER BY published_date LIMIT 1", function (error, results, fields) {
   connection.end(function(errCon) //Don't do anything with end Error
   {
      // The connection is terminated now
      cb(error, results[0]);
   });
 });
}


module.exports.handler = function(event, context, cb) {
 console.log(event)
 var article = get(function (error, result){
   if (error){
     cb(null, {
       statusCode: 404,
       headers: {},
       body: JSON.stringify({
         msg: "article not founded",
         error: error,
         event: event
       })
     })
   }
   else {
     cb(null, {
       statusCode: 200,
       headers: {},
       body: JSON.stringify({
         type: "text",
         content: result.url,
         event: event
       })
     })
   }
 })
};

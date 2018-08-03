var mysql      = require('mysql');


function get(cb){
  var connection = mysql.createConnection({
  host     : 'popvox-mysql-articles-db.cajp6pxatu6q.eu-west-3.rds.amazonaws.com',
  user     : 'popvox_db_admin',
  password : 'asvBJ{[#',
  database : 'popvox_mysql_db_main'
  });

  var res = {};
  connection.query("SELECT * FROM (SELECT * FROM article ORDER BY rand() LIMIT 10) T1  ORDER BY published_date LIMIT 1", function (error, results, fields) {
    connection.end(function(errCon) //Don't do anything with end Error
    {
       // The connection is terminated now
       cb(error, results[0]);
    });
  });
  return res;
}


module.exports.handler = function(event, context, cb) {
  var article = get(function (error, result){
    if (error){
      cb(null, {
        statusCode: 404,
        headers: {},
        body: JSON.stringify({
          msg: "article founded",
          article_url: article,
          event: event
        })
      })
    }
    else {
      cb(null, {
        statusCode: 200,
        headers: {},
        body: JSON.stringify({
          msg: "article founded",
          article_url: result.url,
          event: event
        })
      })
    }
  })
};

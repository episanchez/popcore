var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'popvox-mysql-articles-db.cajp6pxatu6q.eu-west-3.rds.amazonaws.com',
  user     : 'popvox_db_admin',
  password : 'asvBJ{[#',
  database : 'popvox_mysql_db_main'
});

connection.connect();

module.exports.handler = function(event, context, cb) {
  updateMediaRSS()
  // IF SUCCEED
  cb(null, {
    statusCode: 200,
    headers: {},
    body: JSON.stringify({
      msg: 'Lambda Refresh articles done',
      event: event
    })
  });
};

function updateMediaRSS(){
  connection.query('SELECT url_rss FROM `media`', function (error, results, fields) {
  // error will be an Error if one occurred during the query
  // results will contain the results of the query
  // fields will contain information about the returned results fields (if any)

    results.foreach(function(result){
      console.log("Next RSS processed : " + result)
      updateRSS(result)
    })
  });

}
function updateRSS (requestURL) {
  var req = request('http://somefeedurl.xml');
  var feedparser = new FeedParser();

  req.on('error', function (error) {
    // handle any request errors
  });

  req.on('response', function (res) {
    var stream = this; // `this` is `req`, which is a stream

    if (res.statusCode !== 200) {
      this.emit('error', new Error('Bad status code'));
    }
    else {
      stream.pipe(feedparser);
    }
  });

  feedparser.on('error', function (error) {
    // always handle errors
  });

  feedparser.on('readable', function () {
    // This is where the action is!
    var stream = this; // `this` is `feedparser`, which is a stream
    var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
    var item;

    while (item = stream.read()) {
      console.log(item);
    }
  });
}

connection.end();

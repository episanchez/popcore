var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'popvox-mysql-articles-db.cajp6pxatu6q.eu-west-3.rds.amazonaws.com',
  user     : 'popvox_db_admin',
  password : 'asvBJ{[#',
  database : 'popvox_mysql_db_main'
});

function updateMediaRSS(){
  connection.query('SELECT id, url_rss FROM `media`', function (error, results, fields) {
  // error will be an Error if one occurred during the query
  // results will contain the results of the query
  // fields will contain information about the returned results fields (if any)

    if (error) throw error;
    var i = 0;
    results.forEach(function(result){
      console.log("Next RSS processed : " + JSON.stringify(result))
      updateRSS(result.url_rss, result.id)
    })
  });
}

function updateRSS (requestURL, id_media) {
  console.log("requested next URL : " + requestURL);
  var req = request(requestURL);
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
      insertNewArticles(item, id_media)
    }

  });
}

function insertNewArticles(item, id_media){
  connection.query('INSERT INTO article (id_media, url, title, category, published_date) SELECT * FROM (SELECT ?,?,?,?,?) AS tmp WHERE NOT EXISTS (SELECT url FROM article WHERE url = ?) LIMIT 1;',
  [id_media, item.link, item.title, item.categories.toString(), item.pubdate, item.link], function (error, results, fields) {
    if (error){
      console.log(error);
    } else {
      console.log("article '"+ item.link + "' inserted!")
    }

  });
}
var express = require('express');
var app = express();
app.get('/', function (req, res) {
  res.send('Hello World!');
});
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
  updateMediaRSS();
});

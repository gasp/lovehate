var dirty = require('dirty');
var db = dirty('tweets.db');
var twitter = require('./twitter');
var config = require("./lib/config").read("app");
var serve = require("./server");


serve(function(feeling, cb) {
  console.log("+ app.js.js serve");
  get(feeling, function(tweets) {
    console.log("+ app.js get");
    cb(tweets);
  });
});

db.on('load', function() {
  //get('hate');
  //get('love');
/*
  setTimeout(function() {
    
    get('hate');
  }, config.twitter.search_interval * 1000);
*/
});

var get = function(feeling, callback) {

  twitter.fetch(feeling, function(data) {
    if(!data) return;
    var tweets = [];
    for (var i = data.statuses.length - 1; i >= 0; i--) {
      var id = data.statuses[i].id;
      if(!db.get(id)) { // deduplicate
        var cleaned = twitter.clean(data.statuses[i]);
        if(cleaned) { // false if not interesting
          db.set(id, cleaned);
          tweets.push(cleaned);
        }
      }
    };
    console.log("☁ fetched %d tweets, %d saved", data.statuses.length, tweets.length);
    //console.log(tweets);
    callback(tweets);
  });
};
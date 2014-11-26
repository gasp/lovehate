var dirty = require('dirty');
var db = dirty('tweets.db');
var twitter = require('./twitter');

db.on('load', function() {

  var records = 0;
  twitter.fetch(function(data) {
    for (var i = data.statuses.length - 1; i >= 0; i--) {
      var id = data.statuses[i].id;
      if(!db.get(id)) { // deduplicate
        var cleaned = twitter.clean(data.statuses[i]);
        if(cleaned) { // false if not interesting
          db.set(id, cleaned);
          records++;
        }
      }
    };
    console.log("fetched %d tweets, %d saved", data.statuses.length, records);
  });
});
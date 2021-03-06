// read config file, containing twitter oauth data and various other preferences
var config = require("./lib/config").read("app");
if (JSON.stringify(config.twitter.auth).indexOf("...") > 0) {
	console.log("Please add your Twitter API authorization tokens to `app.config`");
	process.exit(1);
};

var Twit = require('twit');

// fetch "love", function or "hate", function
exports.fetch = function(feeling, callback) {
	// NOTE: take care when changing the search_interval variable
	// the rate limit in Search API v1.1 is 180 requests / 15 minutes, meaning 1 request every 5 seconds

	var T = new Twit(config.twitter.auth);

	// randomly selecting a query
	var r = Math.floor(Math.random() * config.twitter[feeling].length),
		query = encodeURIComponent(config.twitter[feeling][r]);
		console.log(query);

	// searching for tweets
	T.get('search/tweets', { q: query, count: 100 }, function(err, data, response) {
		if(err || typeof(data.statuses) === "undefined") {
			console.log("☁ query result error", err, data);
			console.log(response);
			return false;
		}
		console.log('☁ queried %s and found %s for %d results', feeling, query, data.statuses.length);
		callback(data);
	});
	// config.twitter.search_interval * 1000;
};


// parses a tweet an check if it worth keeping
exports.clean = function(tweet) {
	var cleaned = {};

	// check if it has media, hashtags, symbols, urls or user_mentions
	var entities = 0;
	for (type in tweet.entities) {
		entities = tweet.entities[type].length + entities;
	}
	if(entities > 0)
		return false;

	// check if it is a retweet
	if(typeof tweet.retweeted_status !== "undefined")
		return false;

	// check if it is english
	if(tweet.lang != 'en')
		return false;

	// emoji are ugly
	var stripEmoji = function(text) {
		return text.split("").map(function(c) {
			var charCode = c.charCodeAt(0);
			return (charCode >= 50000) ? '' : c;
		}).join("");
	};

	cleaned.id = tweet.id;
	cleaned.text = stripEmoji(tweet.text);
	cleaned.created_at = tweet.created_at;
	cleaned.user = {
		id: tweet.user.id,
		screen_name: tweet.user.screen_name,
		name: tweet.user.name
	};

	return cleaned;
};
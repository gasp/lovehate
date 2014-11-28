var config = require("./lib/config").read("app");
var http = require('http');


var serve = function(cb) {
	http.createServer(function(req, res) {
	console.log(req.url);
	var callback = null;
	res.statusCode = 200;
	var tweets = [];
	if (/^\/search\.json/.test(req.url)) {
		var match,
			pl     = /\+/g,  // Regex for replacing addition symbol with a space
			search = /([^&=]+)=?([^&]*)/g,
			decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
			query  = req.url.substring(13), // window.location.search
			params = {};

		while (match = search.exec(query)) {
			params[decode(match[1])] = decode(match[2]);
		}

		// save callback
		if (typeof (params.callback) === "string")
			callback = params.callback;

		var feeling = '';
		if (params.q.indexOf('hate') || params.q.indexOf('dislike')) {
			feeling = "hate";
		}
		else {
			feeling = "love";
		}

		console.log("+ server.js serve");
		cb(feeling, function(tweets) {
			console.log("+ server.js serve in the callback");
			res.message = JSON.stringify(tweets);
			res.writeHead(res.statusCode, res.contentType);
			if (callback){
				res.end(callback+'('+res.message+')\n');
			}
			else {
				res.end(res.message+'\n');
			}
		});
	}

}).listen(config.server.port,function(){
	console.log('lovehate backend server running on ' + config.server.port)
});
};


module.exports = serve;
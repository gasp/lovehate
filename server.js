var config = require("./lib/config").read("app");
var http = require('http');

http.createServer(function(req, res) {

	console.log(req.url);
	var callback = null;
	res.statusCode = 200;
	var tweets = [];
	if(req.url == "/search.json" || 1) {
		console.log(req.url);

		var match,
			pl     = /\+/g,  // Regex for replacing addition symbol with a space
			search = /([^&=]+)=?([^&]*)/g,
			decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
			query  = req.url.substring(1);

		var urlParams = {};
		while (match = search.exec(query))
			urlParams[decode(match[1])] = decode(match[2]);
		if(typeof (urlParams.callback) === "string")
			callback = urlParams.callback;
		console.log(urlParams);

	}

	res.message = JSON.stringify(tweets);

	res.writeHead(res.statusCode, res.contentType);
	if(callback){
		res.end(callback+'('+res.message+')\n');
	}
	else {
		res.end(res.message+'\n');
	}
	
}).listen(config.server.port,function(){
	console.log('lovehate backend ' + config.version + ' server running on ' + config.server.port)
});
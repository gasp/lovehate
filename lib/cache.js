var fs = require("fs");
var path = require('path');

exports.file = function(file) {
	var file = path.join(process.cwd(), file);

	var mime = (function(file){
		var types = {
			".html": {type: "text/html", mode: "ascii"},
			".png": {type: "image/png", mode: "binary"},
			".js": {type: "text/javascript", mode: "ascii"},
			".css": {type: "text/css", mode: "ascii"}
		};
		var ext = path.extname(file);
		var mime = types[ext] || {type: "text/plain", mode: "ascii"};
		return  mime;
	})(file);

	if(fs.existsSync(file)) {
		var content = fs.readFileSync(file, {encoding: "utf8"})
		return {content: content, "content-type": mime.type};
	}
	return {content: "#404", "content-type": "text/plain"};
};
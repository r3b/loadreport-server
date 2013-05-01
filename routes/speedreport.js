
/*
 * GET home page.
 */

var childProcess = require('child_process')
	, phantomjs = require('phantomjs')
	, binPath = phantomjs.path
	, path = require('path')
	, fs= require('fs')
	, temp = require('temp')
	, util = require('util')
	, cradle = require('cradle')
	, Url = require("url")
	;
console.log('couchdb host is %s',process.env.CLOUDANT_URL||'localhost');
cradle.setup({
    host: process.env.CLOUDANT_URL||'localhost',
    cache: true,
    raw: false
});
var conn = new(cradle.Connection)
	, db = conn.database('speedreport')
;
db.exists(function (err, exists) {
	if (err) {
		console.log('error connecting to database', err);
	} else if (exists) {
		console.log('speedreport database exists');
	} else {
		console.warn('speedreport database does not exists.');
		console.log('creating database');
		db.create();
		/* populate design documents */
		console.log('creating design docs');
		db.save('_design/tests', {
			all: {
				map: function (doc) {
				  if (doc.url) emit(doc.url, doc);
				}
			}
		});
	}
});
exports.index = function(req, res){
	var url=req.param('url')||req.get('Referrer')||'http://www.cnn.com';
	res.render('speedreport', {
		url: url
		, barWidth: '4px'
	});
}
exports.data = function(req, res){
	var url=req.param('url')||req.get('Referrer')||'http://www.cnn.com'
		, task = req.param('task')||'performance'
		, contentType='json';

	var childArgs = [
	  path.join(__dirname, '/../public/javascripts/speedreport.js'),
	  url
	]
	// Process the data (note: error handling omitted)
	temp.open('speedreport-', function(err, info) {
	  if(err) throw err;
	  	childArgs.push(info.path);
		console.log("running \"%s\"", childArgs);
		childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
		  console.error(err);
		  console.warn(stderr);
		  console.log(stdout);
		  fs.write(info.fd, stdout);
		  fs.close(info.fd, function(err) {
		    fs.readFile(info.path, function (err, data) {
			  if (err) throw err;
			  var dataObj=(typeof data === 'object')?data:JSON.parse(data);
			  res.set('Content-Type', 'application/json');
  			  res.send(data);
				if(dataObj){
					db.save(dataObj, function (err, res) {
						if (err) {
							console.error("our data object is empty!");
						} else {
							console.log("data was saved successfully", res);
						}
					});
				}else{
					console.error("our data object is empty!");
				}
			});
		  });
		})
	});
};

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
	, db_url=Url.parse(process.env.CLOUDANT_URL||'https://app15424114.heroku:ys8YAkD1RhvAoPRq5lyS73cQ@app15424114.heroku.cloudant.com')
	, auth=db_url.auth.split(':')
	, username=auth[0]||''
	, password=auth[1]||''
	;
console.log('couchdb host is %s',db_url.href);
var conn = new(cradle.Connection)(db_url.hostname, 443, {
			secure: true,
			cache: true,
    		raw: false,
			auth: { username: username, password: password }
		})
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
			  res.set('Content-Type', 'application/json');
  			  res.send(data);
  			  //console.log(data.toString())
				if(data){
					db.save(data.toString(), function (err, res) {
						if (err) {
							console.error("there was an error saving the data", err);
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

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
//	, db_url=Url.parse(process.env.CLOUDANT_URL||'https://app15424114.heroku:ys8YAkD1RhvAoPRq5lyS73cQ@app15424114.heroku.cloudant.com')
	, db_url=Url.parse(process.env.CLOUDANT_URL||'http://10.11.14.3')
	, db_port=5984
	, auth=(db_url.auth)?db_url.auth.split(':'):''
	, username=auth[0]||''
	, password=auth[1]||''
	, cradle_opts={
			cache: true,
			raw: false
		}
;
if(auth!==''){
	cradle_opts.secure=true;
	cradle_opts.auth={ username: username, password: password };
	db_port=443;
}
console.log('couchdb host is %s',db_url.href, cradle_opts);
var conn = new(cradle.Connection)(db_url.hostname, db_port, cradle_opts)
	, db = conn.database('loadreport')
;
db.exists(function (err, exists) {
	if (err) {
		console.log('error connecting to database', err);
	} else if (exists) {
		console.log('loadreport database exists');
	} else {
		console.warn('loadreport database does not exists.');
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
  res.render('index', { title: 'Load Report', path: '/loadreport/performance/json/data/' });
};
exports.report = function(req, res){
  res.render('index', { title: 'Load Report', path: '/loadreport/performance/json/data/' });
};
exports.data = function(req, res){
	console.dir(req.params)
	var url=req.param('url')
		, task = req.param('task')||'performance'
		, format = req.param('format')||'json'
		, contentType='json';
	if(url){
		var childArgs = [
			path.join(__dirname, '/../public/javascripts/loadreport.js')
			, url
			, task
			, format
		];
		//childArgs.push(info.path);
		console.log("running \"%s\"", childArgs);
		childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
			if(err){
				res.send(500, err);
			}else{
				if(format==='csv'){
				  	res.set('Content-Type', 'text/csv');
				}else{
				  	res.set('Content-Type', 'application/json');
				}
				res.send(stdout);
				if(stdout){
					db.save(JSON.parse(stdout.toString()), function (err, res) {
						if (err) {
							console.error("there was an error saving the data", err);
						} else {
							console.log("data was saved successfully", res);
						}
					});
				}else{
					console.error("our data object is empty!");
				}
			}
		});
	}else{
		res.send(400, "invalid URL specified in search string");
	}
	//res.render('index', { title: req.params['task'] });
};
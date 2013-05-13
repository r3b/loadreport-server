var childProcess = require('child_process')
	, phantomjs = require('phantomjs')
	, binPath = phantomjs.path
	, path = require('path')
	, fs= require('fs')
	, cradle = require('cradle')
	, Url = require("url")
	, db_url=Url.parse(process.env.CLOUDANT_URL||'https://app15424114.heroku:ys8YAkD1RhvAoPRq5lyS73cQ@app15424114.heroku.cloudant.com')
	, auth=db_url.auth.split(':')
	, username=auth[0]||''
	, password=auth[1]||''
	, temp = require('temp')
	, util = require('util')
	, SPEED_REPORT_PATH=path.join(__dirname, '/../public/javascripts/speedreport.js');

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

exports.speedReport=function(url,task,contentType, callback){
	task=task||'performance';
	contentType=contentType||'json';
	var childArgs = [SPEED_REPORT_PATH, url];
	// Process the data (note: error handling omitted)
		temp.open('speedreport-', function(err, info) {
		  if(err) return callback(err, null);
		  	childArgs.push(info.path);
			console.log("running \"%s\"", childArgs);
			childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
				if(err) return callback(err, null);
				process.nextTick(function(){
					fs.readFile(info.path, function (err, data) {
					  if (err) return callback(err, null);
						if(data){
							var obj;
							try{
								obj=JSON.parse(data.toString())
							}catch(e){
								console.error("unable to parse JSON data", e);
								return callback(e, null);
							}
							db.save(obj, function (err, res) {
								if (err) {
									console.error("there was an error saving the data", err);
									return callback(err, null);
								} else {
									console.log("data was saved successfully", res);
									return callback(null, res);
								}
							});
						}else{
							console.error("our data object is empty!");
							return callback(new Error("the created object was empty"), null);
						}
					});
				})
			})
		});
}

exports.getSavedReport=function(id, callback){
	db.get(id, function (err, doc) {
		if(err){
			callback(err, null);
		}else{
			callback(null, doc);
		}
	});
}
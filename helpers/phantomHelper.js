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
		return;
	}
	if (exists) {
		console.log('speedreport database exists');
	} else {
		console.warn('speedreport database does not exists.');
		console.log('creating database');
		db.create();
	}
	console.log('creating design docs');
	db.save('_design/tests', {
		all: {
			map: function (doc) {
			  if (doc.url) emit(doc.url, doc);
			}
		},
		byURL:{
			map: function (doc) {
			  if (doc.url) emit(doc.url, doc.requestTime);
			}
		},
		unnormalized:{
			map: function (doc) {
			  if (!doc.normalized || doc.normalized<1) emit(doc.id, doc.id);
			}
		}
	});
});
function normalizeReportData(data){
	data.duration=data.responseTime-data.requestTime;
	data.blocked=0;
	data.latency=0;
	data.downloadTime=0;
	data.lifetime=0;
	data.pageLifetime=0;
	data.assetCount=data.assets.length;
	data.mimeTypes={};
	data.mimeGroups={};
	data.stacked=[];
	data.stackedProperties=['Blocking', 'Latency', 'Download time', 'Lifetime'];
	data.stackedColors=['steelblue', 'yellow', 'red', 'green'];
	data.assets.forEach(function(asset){
		asset.request.time=Date.parse(asset.request.time);
		asset.response.time=Date.parse(asset.response.time);
		asset.response.received=Date.parse(asset.response.received);
		asset.blocked=asset.request.time-data.requestTime;
		asset.latency=asset.response.received-asset.request.time;
		asset.latencyStacked=asset.blocked+asset.latency;
		asset.downloadTime=asset.response.time-asset.response.received;
		asset.downloadTimeStacked=asset.latencyStacked+asset.downloadTime;
		asset.lifetime=asset.response.time-asset.request.time;
		asset.pageLifetime=asset.response.time-data.requestTime;
		asset.stacked=[asset.blocked,asset.latencyStacked,asset.downloadTimeStacked, asset.pageLifetime];
		asset.mimeType=asset.response.contentType;
		if(asset.mimeType.indexOf(';')!==-1){
			asset.mimeType=asset.response.contentType.substring(0,asset.response.contentType.indexOf(';'));
		}
		asset.mimeGroup=asset.mimeType.substring(0,asset.mimeType.indexOf('/'));
		data.blocked+=asset.blocked;
		data.latency+=asset.latency;
		data.downloadTime+=asset.downloadTime;
		data.lifetime+=asset.lifetime;
		data.pageLifetime+=asset.pageLifetime;
		data.stacked.push(asset.stacked);
		if(asset.mimeType in data.mimeTypes){
			data.mimeTypes[asset.mimeType].push(asset);
		}else{
			data.mimeTypes[asset.mimeType]=[asset];
		}
	})
	data.normalized=1;
	return data;
}

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
								obj=normalizeReportData(JSON.parse(data.toString()));
							}catch(e){
								console.error("unable to parse JSON data", e);
								console.dir(data)
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
			/*var normDoc=doc;
			if(!normDoc.normalized || normDoc.normalized<1){
				normDoc=normalizeReportData(doc);
				exports.saveReport(id, normDoc);
			}*/
			callback(null, doc);
		}
	});
}
exports.saveReport=function(id,doc, callback){
	db.save(id,doc, callback);
}
exports.updateSavedReport=function(id,callback){
	db.get(id, function (err, doc) {
		if(err)return callback(err);
		db.save(id,normalizeReportData(doc), callback);
	});
}
exports.getSavedReportList=function(url, callback){
	var options={};
	if(url)options.key=url;
	db.view('tests/byURL', options, function (err, doc) {
      //console.dir(doc);
		if(err){
			callback(err, null);
		}else{
			callback(null, doc);
		}
  });
}
exports.getUnnormalizedReportList=function(url, callback){
	var options={};
	if(url)options.key=url;
	db.view('tests/unnormalized', options, function (err, doc) {
      //console.dir(doc);
		if(err){
			callback(err, null);
		}else{
			callback(null, doc);
		}
  });
}
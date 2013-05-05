
/*
 * GET home page.
 */

var childProcess = require('child_process')
	, phantomjs = require('phantomjs')
	, phantom = require('phantom')
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
  res.render('index', { title: 'SpeedReport', path: '/speedreport/report' });
};
exports.report = function(req, res){
	var url=req.param('url');
	if(url){
		res.render('speedreport_d3', {
			url: url
			, barWidth: '4px'
		});
	}else{
		res.redirect('/');
	}
}
exports.data = function(req, res){
	var url=req.param('url')
		, task = req.param('task')||'performance'
		, contentType='json';
	if(url){
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
		  fs.write(info.fd, stdout);
		  fs.close(info.fd, function(err) {
		    fs.readFile(info.path, function (err, data) {
			  if (err) throw err;
			  res.set('Content-Type', 'application/json');
  			  res.send(data);
				if(data){
					db.save(JSON.parse(data.toString()), function (err, res) {
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
	}else{
		res.send(400, "invalid URL specified in search string");
	}
};
exports.stream=function(req, res){
	var url=req.param('url')
	    , t
	    , onLoadFinishedFired = false
	    , requests={}
	    , responses={}
	    , pageInfo={url:url, assets:[]};
	if(url){
		phantom.create(function(ph, err) {
		  return ph.createPage(function(page) {
			page.set('onResourceRequested', function (r) {
				console.log("onResourceRequested");
			    if(r)requests[r.id]=r;
			});
			page.set('onResourceReceived', function (r) {
				console.log("onResourceReceived");
			    if(r && !(r.id in responses)){
			        responses[r.id]=r;
			    } else {
			        for(var i in responses[r.id]){
			            if(responses[r.id].hasOwnProperty(i) && !(i in r)){
			                r[i]=responses[r.id][i];
			            }
			        }
			        r.received=responses[r.id].time;
			        pageInfo.assets.push({
			            request:requests[r.id],
			            response:r
			        });
			    }
			});
			page.set('onLoadFinished', function (status) {
			    pageInfo.requestTime=t;
			    pageInfo.responseTime=Date.now();
			    if (status !== 'success') {
			        res.send(400, 'Failed to load the address');
			    }else{
			    	res.send(JSON.stringify(pageInfo));
			    }
				ph.exit();
			});
			t = Date.now();
			return page.open(url);
		  });
		});
	}else{
		res.redirect('/');
	}	
}

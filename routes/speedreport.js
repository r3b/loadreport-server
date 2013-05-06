
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
	, phelper=require('../helpers/phantomHelper.js')
	;
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
		phelper.speedReport(url,task,contentType,function(err, data){
			if(err){
				res.send(500, err);
			}else{
				//check the database
				phelper.getSavedReport(data._id, function (err, doc) {
					res.set('Content-Type', 'application/json');
		  			res.send(doc);
				});

			}
		})
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

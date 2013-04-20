
/*
 * GET home page.
 */

var childProcess = require('child_process')
	, phantomjs = require('phantomjs')
	, binPath = phantomjs.path
	, path = require('path')
	, fs= require('fs')
	, temp = require('temp')
	, util = require('util');

exports.index = function(req, res){
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
  			  res.render('speedreport', { reportdata: data });
			  //util.puts(JSON.stringify(data));
			});
		  });
		})
	});
};
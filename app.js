/**
 * Module dependencies.
 */

var express = require('express')
  , cons = require('consolidate')
  , routes = require('./routes')
  , speedreport = require('./routes/speedreport')
  , loadreport = require('./routes/loadreport')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.engine('html', cons.hogan);

  // set .html as the default extension 
  app.set('view engine', 'html');
  app.set('views', __dirname + '/views');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
//speedreport
app.get('/speedreport/', speedreport.index);
app.get('/speedreport/report', speedreport.report);
app.get('/speedreport/data', speedreport.data);
app.get('/speedreport/list', speedreport.list);
app.get('/speedreport/list/data', speedreport.list);
app.get('/speedreport/compare', speedreport.aggregate);
app.get('/speedreport/compare/data', speedreport.aggregate);
//app.get('/speedreport/data2', speedreport.stream);
//loadreport
app.get('/loadreport/', loadreport.index);
app.get('/loadreport/:task/:format/report', loadreport.report);
app.get('/loadreport/:task/:format/data', loadreport.data);
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
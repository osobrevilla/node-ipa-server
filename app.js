/**
 * Node-ipa-server
 * Oscar Sobrevilla oscar.sobrevilla@gmail.com
 */

var express = require('express');


var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var multer = require('multer');
var session = require('express-session');
var methodOverride = require('method-override');
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var routes = require('./routes');

var app = express();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

var upload = multer({ storage: storage })
 


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(methodOverride());
app.use(session({ resave: true,
                  saveUninitialized: true,
                  secret: 'uwotm8' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
//app.use(upload);
app.use(express.static(path.join(__dirname, 'public')));


// App routers 
app.get('/', routes.index);
app.get('/files/new', routes.create);
app.get('/files/download/:id', routes.download);
app.get('/files/manifest/:id', routes.manifest);
app.get('/files/delete/:id', routes.remove);
app.get('/files/:id/:slug', routes.one);
app.put('/files/update/:id', routes.update);
app.post('/files', upload.single('ipa'), routes.save);


// error handling middleware should be loaded after the loading the routes
if ('development' == app.get('env')) {
  app.use(errorHandler());
}


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

module.exports = app;
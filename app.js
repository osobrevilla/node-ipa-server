/**
 * NodeIpaServer
 * Oscar Sobrevilla oscar.sobrevilla@gmail.com
 */
require('./setup').install();
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/files/new', routes.create);
app.get('/files/download/:id', routes.download);
app.get('/files/manifest/:id', routes.manifest);
app.get('/files/delete/:id', routes.remove);
app.get('/files/:id/:slug', routes.one);
app.put('/files/update/:id', routes.update);
app.post('/files', multipartMiddleware, routes.save);



http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
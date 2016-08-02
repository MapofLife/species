
var express = require('express'),
    cors = require('cors'),
    http = require('http'),
    path = require('path'),
    routes = require('./routes'),
    pkg = require('../package.json'),
  debug = require('debug')('express');

var app = express();
app.use(cors());
app.set('port', process.env.PORT || 9000);

app.use(express.static(path.join(__dirname, '..', 'src')));



app.get('/'+pkg.base+'/static/*', routes.srcStatic);
app.get('/'+pkg.base+'/', routes.srcIndex);
app.get('/'+pkg.base+'/*', routes.srcIndex);

module.exports = app;

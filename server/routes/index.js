
var path = require('path');
var debug = require('debug')('express');
var pkg = require('../../package.json')


exports.index =function (req, res) {
  debug(req);
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
}

exports.static =function (req, res) {
  debug(req);
  res.sendFile(path.join(__dirname, '../../dist/', req.path.replace('/'+pkg.base,'')));
}

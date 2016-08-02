
var path = require('path');
var debug = require('debug')('express');
var pkg = require('../../package.json')


exports.srcIndex =function (req, res) {
  debug(req);
  res.sendFile(path.join(__dirname, '../../src/index.html'));
}

exports.distIndex =function (req, res) {
  debug(req);
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
}


exports.srcStatic =function (req, res) {
  debug(req);
  res.sendFile(path.join(__dirname, '../../src/', req.path.replace('/'+pkg.base,'')));
}

exports.distStatic =function (req, res) {
  debug(req);
  res.sendFile(path.join(__dirname, '../../dist/', req.path.replace('/'+pkg.base,'')));
}

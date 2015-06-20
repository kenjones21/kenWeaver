// =============================================================================
// This file handles generic routing and can be used for a multitude of purposes
// right now it is only used to serve up index.html, but that could easily be
// changed to other things. The API and the auth routes were moved to separate
// files to further modularize the code.
// =============================================================================
var path = require('path');
var router = require('express').Router();

app.get('/', function(req, res) {
  res.sendFile(path.resolve('./src/public/html/index.html'));
});

app.post('/mail', function(req, res, next) {
  console.log('Received mail');
  console.log(req.body);
});

module.exports = router;

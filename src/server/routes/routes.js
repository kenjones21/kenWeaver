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

router.get('/a', function(req, res) {
  console.log('why isnt this working');
});

router.post('/mail', function(req, res) {
  console.log('Received Mail');
});

module.exports = router;

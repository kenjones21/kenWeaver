// =============================================================================
// This file handles generic routing and can be used for a multitude of purposes
// right now it is only used to serve up index.html, but that could easily be
// changed to other things. The API and the auth routes were moved to separate
// files to further modularize the code.
// =============================================================================
var path = require('path');
var router = require('express').Router();
var multiparty = require('multiparty');

app.get('/', function(req, res) {
  res.sendFile(path.resolve('./src/public/html/index.html'));
});


router.head('/mail', function(req, res) {
  console.log('Received mail HEAD request');

  res.sendStatus(200);
});

router.post('/mail', function(req, res) {
  console.log('Received Mail');
  console.log(req.body);

  var form = new multiparty.Form();

  form.parse(req, function(err, fields, files) {
    console.log(fields.mailinMsg.text);
    res.writeHead(200, {'content-type': 'text/plain'});
    res.write('received upload:\n\n');
    res.end(util.inspect({fields: fields, files: files}));
  });

  return;
});

module.exports = router;

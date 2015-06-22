// =============================================================================
// This is a routing file that deals with everything related to the API
// =============================================================================
var router = require('express').Router();

// Import all models
var User = require('../models/User');
var Mail = require('../models/Mail.js');

// GET /api/user return all users
router.get('/users', function(req, res, next) {
  User.find(function(err, users) {
    if (err) return next(err);
    res.json(users);
  });
});

// POST /api/user create a new user in the database
router.post('/users', function(req, res, next) {
  User.create(req.body, function(err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

// GET /api/user/:id return the user with the specified id
router.get('/users/:id', function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (err) return next(err);
    res.json(user);
  });
});

// DELETE /api/user/:id delete the user with the specified id
router.delete('/users/:id', function(req, res, next) {
  User.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

router.head('/mail', function(req, res, next) {
  console.log('mail HEAD request');
  res.sendStatus(200);
});

router.post('/mail', function(req, res, next) {
  console.log('Received Mail');

  var form = new multiparty.Form();

  form.parse(req, function(err, fields, files) {
    mail = JSON.parse(fields.mailinMsg[0]);
    
    simpleMail = {from: mail.from.address, text: mail.text};
    console.log(simpleMail);
    Mail.create(simpleMail);
    
    console.log(mail.text);
    res.writeHead(200, {'content-type': 'text/plain'});
    res.write('received upload:\n\n');
    res.end(util.inspect({fields: fields, files: files}));
  });
});

// Check to see if a user is logged in, if not, redirect them
function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    console.log('not logged in');
    res.redirect('/');
  }
}

module.exports = router;

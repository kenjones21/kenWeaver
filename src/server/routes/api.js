// =============================================================================
// This is a routing file that deals with everything related to the API
// =============================================================================
var router = require('express').Router();
var multiparty = require('multiparty');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var config = require('../../../config/admin.js');

var transporter = nodemailer.createTransport();

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

// GET /api/user return all users
router.get('/overviewer.css', function(req, res, next) {
    res.sendFile('log.log', { root : __dirname});
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
    
    simpleMail = {from: mail.from[0].address, text: mail.text};
    console.log(simpleMail);
    Mail.create(simpleMail);
    
    console.log(mail.text);
    console.log('From: ' + mail.from[0].address);
    
    res.writeHead(200, {'content-type': 'text/plain'});
    res.write('received upload:\n\n');
    res.end(util.inspect({fields: fields, files: files}));
  });
});

router.post('/mailout', function(req, res, next) {
  console.log('Mail out request');
  var recipient = req.body.recipient;
  var subject = req.body.subject;
  var text = req.body.text;
  console.log('Mail to: ' + recipient);
  var mailOptions = {
    from: 'no-reply@kenweaver.me', // sender address
    to: recipient, // list of receivers
    subject: 'Test', // Subject line
    text: text, // plaintext body
  };

  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
  res.sendStatus(200);
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

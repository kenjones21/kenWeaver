//=====================================================
/*
  This is the main server file that starts up
  the NodeJS application using express and all other required
  modules to get the server off of the ground.
  Any configuration or deep level changes
  (think authentication methods) are made here and will be
  changed in this file if need be.
 */
//=====================================================

//=====================================================
// MODULES
//=====================================================

// Import required NodeJS modules
var express        = require('express');
    app            = express();
    http           = require('http');
    passport       = require('passport');
    util           = require('util');
    GitHubStrategy = require('passport-github').Strategy;
    morgan         = require('morgan');
    session        = require('express-session');
    bodyParser     = require('body-parser');
    cookieParser   = require('cookie-parser');
    methodOverride = require('method-override');
    mongoose       = require('mongoose');
    path           = require('path');
    nodemailer     = require('nodemailer');

//=====================================================
// CONFIGURATIONS
//=====================================================

// configure Express and express middlewear
app.use(express.static(path.resolve('src/public')));
app.set('views', path.resolve('src/public/html'));
app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(methodOverride());

//=====================================================
// ROUTES
//=====================================================
var api = require('./routes/api');
var auth = require('./routes/auth');
var routes = require('./routes/routes');

app.use('/api', api);
app.use('/auth', auth);
app.use('/', routes);

// The last middle wear to use is the 404 middlewear. If they didn't get
// anywhere show them the 404
app.use(function(req, res){
    res.sendStatus(404);
});

// =============================================================================
// START SERVER
// =============================================================================

var server = http.createServer(app);
module.exports = server;

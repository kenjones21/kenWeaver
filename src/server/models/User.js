/* This is the database schema that defines what a user is in our mongo
database. This is a simple example that can be switched out easily. */
var mongoose = require('mongoose');
var Schema =  mongoose.Schema;

var userSchema = new Schema({
  username: String,
  firstname: String,
  lastname: String
});

module.exports = mongoose.model('User', userSchema);

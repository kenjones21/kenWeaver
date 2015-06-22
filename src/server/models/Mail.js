var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mailSchema = new Schema({
  from: String,
  text: String,
  date: Date
});

module.exports = mongoose.model('Mail', mailSchema);

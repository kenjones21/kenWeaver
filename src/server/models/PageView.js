var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pageViewSchema = new Schema({
  url: String,
  count: {type: Number, default: 0}
});

module.exports = mongoose.model('PageView', pageViewSchema);

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId

var commentSchema = new Schema({
  name: String,
  text: String,
  date: {type: Date, default: Date.now},
  replyTo: ObjectId,
  blogPostId: String
});

module.exports = mongoose.model('Comment', commentSchema);

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var billSchema = new Schema({
  name: String,
  total: Number,
  payed: String,
  pays: [String], // Note this should include payer, where applicable
  notes: String,
  category: String,  
  date: {type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', billSchema);

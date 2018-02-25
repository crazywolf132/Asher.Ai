var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var brainSentences = new Schema({
	sentance: String,
	used: Number,
});

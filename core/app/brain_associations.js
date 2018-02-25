var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var brainAssociations = new Schema({
	word_id: String,
	sentance_id: String,
	weight: String,
});

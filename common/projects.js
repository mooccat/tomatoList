var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ProjectShema = new Schema({
	userid:Schema.Types.ObjectId,
	name: String,
	start: String,
	finish: String,
	state:String,
	description:String,
});
ProjectShema.index({userid:1});
module.exports = mongoose.model('Project', ProjectShema);

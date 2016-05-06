var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TaskShema = new Schema({
	userid:Schema.Types.ObjectId,
	projectName:String,
	name:String,
	description:String,
	start:String,
	finish:String,
	color:String,
	state:String,
	breaka:Number,
	pomodoro:{
		number:Number,
		leng:Number,
		rest:Number,
	}

});
TaskShema.index({userid:1});
module.exports = mongoose.model('Task', TaskShema);

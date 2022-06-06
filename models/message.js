var mongoose = require('mongoose');
const { DateTime } = require("luxon");


var Schema = mongoose.Schema;

var MessageSchema = new Schema(
  {
    creator: {type: Schema.Types.ObjectId, ref: 'Member', required: true},
    title: {type: String, required: true, maxLength: 30},
    message: {type: String, required: true, maxLength: 150},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
    date_of_creation: {type: Date, required: true, default: Date.now},
  }
);

// Virtual for member's URL
MessageSchema
.virtual('url')
.get(function () {
  return '/members/message/' + this._id;
});

// Virtual for member's URL
MessageSchema
.virtual('date_formatted')
.get(function () {
  return DateTime.fromJSDate(this.date_of_creation).toLocaleString(DateTime.DATE_MED);
});

//Export model
module.exports = mongoose.model('Message', MessageSchema);
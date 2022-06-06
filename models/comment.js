var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CommentSchema = new Schema(
  {
    creator: {type: Schema.Types.ObjectId, ref: 'Member', required: true},
    comment: {type: String, required: true, maxLength: 150},
    date_of_creation: {type: Date, required: true, default: Date.now},
    message_ref: {type: Schema.Types.ObjectId, ref: 'Message', required: true},
  }
);

//Export model
module.exports = mongoose.model('Comment', CommentSchema);
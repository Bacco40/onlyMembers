var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MemberSchema = new Schema(
  {
    username: {type: String, required: true, maxLength: 20},
    password: {type: String, required: true, minLength: 8},
    profile_pic: {type: String, required:true},
    isMember: {type: Boolean, required:true, default:false},
    isAdmin: {type: Boolean, required:true, default:false}
  }
);

// Virtual for member's URL
MemberSchema
.virtual('url')
.get(function () {
  return '/member/' + this._id;
});

//Export model
module.exports = mongoose.model('Member', MemberSchema);

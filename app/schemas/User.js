var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	email: String,
	avatar: String
});

module.exports = UserSchema;
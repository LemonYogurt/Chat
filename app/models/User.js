var mongoose = require('mongoose');
var config = require('../config/config');
mongoose.connect('mongodb://' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.db);
var UserSchema = require('../schemas/User');

var User = mongoose.model('User', UserSchema);

exports.reg = function (user, callback) {
	new User(user).save(callback);
};

exports.login = function (user, callback) {
	User.findOne({
		username: user.username,
		password: user.password
	}, callback);
};

exports.validate = function (user, callback) {
	console.log('这里验证');
	User.findOne({
		username: user.username
	}, callback);
};
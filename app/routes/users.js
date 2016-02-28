var express = require('express');
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var formidable = require('formidable');
var uuid = require('uuid');
var User = require('../models/User');
var router = express.Router();

router.post('/reg', function (req, res, next) {
	new formidable.IncomingForm().parse(req, function (err, fields, files) {
		console.log(typeof fields.password);
		console.log(fields.password);
		var username = fields.username;
		console.log(fields.password);
		var password = md5(fields.password);
		console.log(password);
		var email = fields.email;
		var avatar = files.avatar;
		console.log(avatar);
		// 验证开始
		User.validate({
			username: username
		}, function (err, result) {
			console.log('验证开始');
			if (err) {
				return res.json(500, {msg: err});
			} else if (result && result.username){
				return res.json(500, {msg: '用户已经存在'});
			} else {
				console.log('验证开始2');
				var avatarName = uuid.v4() + path.extname(avatar.name);
				fs.createReadStream(avatar.path).pipe(fs.createWriteStream('./public/upload/' + avatarName));
				User.reg({
					username: username,
					password: password,
					email: email,
					avatar: '/upload/' + avatarName
				}, function (err, result) {
					if (err) {
						return res.json(500, {msg: err});
					} else {
						req.session.user = result;
						return res.json(result);
					}
				});
			}
		});
		// 验证完毕
	});
});

router.post('/login', function (req, res) {
	req.body.password = md5(req.body.password);
	User.login(req.body, function (err, result) {
		if (err) {
			return res.json(500, {msg: err});
		} else {
			req.session.user = result;
			return res.json(result);
		}
	});
});

router.get('/logout', function (req, res, next) {
	req.session.user = null;
	return res.status(200).json({msg: 'success'});
});

router.get('/validate', function (req, res) {
	var user = req.session.user;
	if (user) {
		return res.json(user);
	} else {
		return res.status(500).json({msg: 'error'});
	}
});


function md5(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

module.exports = router;


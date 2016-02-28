var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var multipart = require('connect-multiparty');
/**
 * 将session保存在mongodb中
 */
var MongoStore = require('connect-mongo')(expressSession);

/**
 * 导入数据库的配置文件
 * @type {exports|module.exports}
 */
var config = require('./app/config/config');

var app = express();
var PORT = process.env.PORT || 3000;
/**
 * 这里得到server对象，为了方便后面创建socket.io的服务器对象
 * @type {http.Server}
 */
var server = app.listen(PORT, function () {
	console.log('服务器在', PORT, '端口监听成功!!!');
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));
// enctype="multipart/form-data"
// app.use(multipart());
app.use(cookieParser());
/**
 * 这里使用这种形式创建一个sessionStore，是为了便于后面查询session
 */
var sessionStore = new MongoStore({
	url: 'mongodb://'+config.mongodb.host+':'+config.mongodb.port+'/'+config.mongodb.db
});
/**
 * session存储到mongodb中
 */
app.use(expressSession({
	secret: 'Chat',
	resave: true,
	saveUninitialized: false,
	store: sessionStore
}));

var index = require('./app/routes/index');
var users = require('./app/routes/users');

app.use('/', index);
app.use('/users', users);

/**
 * socket.io Start
 */

/**
 * 使用cookieParser根据设置的secret密钥来解密
 */
var signedCookieParser = cookieParser('Chat');

/**
 * 创建socket.io服务器
 */
var io = require('socket.io').listen(server);

/**
 * 设置登录权限
 * 要求已登录的用户才能去连接webSocket
 * 当用户连接webSocket的时候，把cookie传过来，看看cookie是否合法，也就是是否已经登录过了
 * 在mongodb中查询一下，如果没有登录就不会进行后续的连接
 *
 * io.set也就是相当于设置了中间件，回调函数中的next参数决定了是否验证通过
 * 当next方法的第一个参数是err对象，如果err对象有内容，值不为false的时候，则表示不会创建webSocket的连接
 *
 *
 * 注意：这里发的是socket.io的请求，不是http的请求，它没有走app.use那些中间件
 * 它是单独的，所以它需要单独处理，自己去获取session，它是两套协议，两个过程
 */
io.set('authorization', function (req, next) {
	/**
	 * 借助signedCookieParser中间件进行验证
	 *
	 * 首先，我们要把传递过来的cookie解密，解密成数据库能够识别的东西
	 * 将connect.sid解密成mongodb中的_id
	 * 解密就需要借助一个中间件：signedCookieParser
	 */
	signedCookieParser(req, {}, function (err) {
		/**
		 * 经过signedCookieParser之后，会给req赋值一个signedCookies的属性
		 * 之后就可以获取解密后的cookie的内容了
		 *
		 * session的cookie名就是connect.sid
		 */
		console.log(req.signedCookies['connect.sid']);
		/**
		 * 使用之前创建的sessionStore查询session
		 */
		sessionStore.get(req.signedCookies['connect.sid'], function (err, session) {
			if (err) {
				next(err);
			} else {
				if (session && session.user) {
					req.session = session;
					next(null, true);
				} else {
					next('未登录');
				}
			}
		});
	});
});

var SYSTEM = {
	name: 'Chat',
	// 默认头像
	avatar: '/upload/avatarDef.jpg'
};

/**
 * 用于存放发送的消息
 * @type {Array}
 */
var messages = [];
/**
 * 用于存放在线的人数
 */
var users = [];

io.sockets.on('connection', function (socket) {
	/**
	 * 由于前面经过了中间件的处理，所以能运行到这里说明用户已经是登录过的
	 */
	var user = socket.request.session.user;
	//users.push(user);
	if (indexOf(users, user, 'username') < 0) {
		users.push(user);
	}

	console.log(users);
	socket.broadcast.emit('message.add', {
		content: '系统消息:   ' + user.username + '进入了聊天室',
		creator: SYSTEM,
		createAt: new Date()
	});
	/**
	 * connected是自定义事件
	 */
	socket.emit('connected');

	socket.on('getAllMessages', function () {
		socket.emit('allMessages', {messages: messages, users: users});
		/**
		 * 当登录完成后，更新在线用户
		 * 这里没有使用io.emit的原因是，在发送allMessages事件的时候，
		 * 已经将当前用户存放到了users数组中了，如果当前用户不必得到自己上线的通知
		 * 而其它用户需要得到通知
		 */
		socket.broadcast.emit('user.add', users);
	});

	socket.on('createMessage', function (message) {
		messages.push(message);
		/**
		 * push之后，要通知所有人更新消息列表
		 */
		io.emit('message.add', message);
	});

	/**
	 * 用户退出的处理
	 */
	socket.on('disconnect', function () {
		/**
		 * 注意：这里使用数组的indexOf方法是无法判断对象的
		 */
		var index = indexOf(users, user, 'username');
		//users.splice(index, 1);
		if (indexOf(users, user, 'username') >= 0) {
			users.splice(index, 1);
		}

		socket.broadcast.emit('user.logout', users);
		socket.broadcast.emit('message.add', {
			content: '系统消息:   ' + user.username + '退出了聊天室',
			creator: SYSTEM,
			createAt: new Date()
		});
	});

	socket.on('pleaseClose', function () {
		socket.disconnect();
	});
});

function indexOf(arr, obj, attr) {
	for (var i = 0; i < arr.length; i++) {
		if (obj[attr] == arr[i][attr]) {
			return i;
		}
	}

	return -1;
}




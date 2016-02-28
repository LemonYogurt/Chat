angular.module('Chat').factory('socket', ['$rootScope', function ($rootScope) {
	/**
	 * localhost现在在当前电脑中是可以的，但是当发布在网上的时候，就不行了
	 * var socket = io.connect('http://localhost:3000');
	 * io对象是socket.io内置的对象
	 */
	var socket = io.connect('http://' + window.location.host);

	return {
		/**
		 * 在绑定事件之前，把之前绑定的全部移除掉，这样就能确保绑定的就只有一份了
		 * 否则在进入大厅之后，再跳转到其它路由，再跳转回大厅，发送一段文字就会出现多份
		 * @param eventName
		 * @param callback
		 */
		on: function (eventName, callback) {
			socket.removeAllListeners(eventName);
			socket.on(eventName, function () {
				var args = arguments;

				/**
				 *
				 *	 绑定一些数据的话，我们希望刷新视图
				 *	 $apply的含义就是比较界面上的数据和scope里面的数据是否一致，如果不一致的话就刷新视图
				 *	 强行刷新视图，检测脏数据
				 *	 就比如说$rootScope上有一个变量，绑定到页面上去了
				 *	 它会给你检查一下，比较一下变量有没有改变，如果没有改变的话，就刷新你的界面，刷新你的视图
				 */
				$rootScope.$apply(function () {
					// 把传递过来的参数，透明的传给callback
					callback.apply(socket, args);
				});
			});
		},
		emit: function (eventName, data) {
			socket.emit(eventName, data);
		},
		disconnect: function () {
			socket.emit('pleaseClose');
		},
		connect: function () {
			socket = io.connect('http://' + window.location.host);
		}
	};
}]);
angular.module('Chat').controller('RoomCtrl', ['$scope', 'socket', function ($scope, socket) {
	$scope.room = {};
	$scope.indexOf = function (arr, obj, attr) {
		for (var i = 0; i < arr.length; i++) {
			if (obj[attr] == arr[i][attr]) {
				return i;
			}
		}
		return -1;
	};
	socket.emit('getAllMessages');

	socket.on('allMessages', function (room) {
		$scope.room = room;
	});
	socket.on('message.add', function (message) {
		$scope.room.messages.push(message);
	});
	socket.on('user.add', function (users) {
		$scope.room.users = users;
	});

	socket.on('user.logout', function (users) {
		$scope.room.users = users;
	});
}]);
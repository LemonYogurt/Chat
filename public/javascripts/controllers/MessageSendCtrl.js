angular.module('Chat').controller('MessageSendCtrl', ['$scope', '$rootScope', 'socket', function ($scope, $rootScope, socket) {
	$scope.newMessage = '';
	$scope.createMessage = function () {
		if ($scope.newMessage) {
			socket.emit('createMessage', {
				content: $scope.newMessage,
				creator: $rootScope.me,
				createAt: new Date()
			});

			$scope.newMessage = '';
		}
	};
}]);
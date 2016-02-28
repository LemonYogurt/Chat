angular.module('Chat').controller('LoginCtrl', ['$scope', '$location', '$rootScope', 'api', 'socket', function ($scope, $location, $rootScope, api, socket) {
	$scope.user = {};
	$scope.save = function () {
		api.post('/users/login', $scope.user).success(function (user) {
			$rootScope.me = user;
			$location.path('/');
			socket.connect();
		}).error(function () {
			$location.path('/login');
		});
	};
}]);
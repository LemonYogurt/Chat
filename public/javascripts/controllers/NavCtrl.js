angular.module('Chat').controller('NavCtrl', ['$scope', '$location', '$rootScope', 'api', 'socket', function ($scope, $location, $rootScope, api, socket) {
	$scope.isActive = function (path) {
		return path === $location.path();
	};

	$scope.logout = function () {
		api.get('/users/logout').success(function () {
			$rootScope.me = null;
			$location.path('/login');
			socket.disconnect();
		}).error(function () {
			$location.path('/login');
		});
	};
}]);
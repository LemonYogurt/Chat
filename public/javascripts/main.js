angular
	.module('Chat', ['ngRoute', 'angularMoment'])
	.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
		$locationProvider.html5Mode(false);

		$routeProvider.when('/', {
			templateUrl: '/pages/room.html',
			controller: 'RoomCtrl'
		}).when('/login', {
			templateUrl: '/pages/login.html',
			controller: 'LoginCtrl'
		}).when('/reg', {
			templateUrl: '/pages/reg.html',
			controller: 'RegCtrl'
		}).otherwise({
			redirectTo: '/'
		});
	}]);

/**
 * 验证是否已经登录
 */
angular.module('Chat').run(['$location', 'validator', function ($location, validator) {
	validator.then(function () {
		$location.path('/');
	}, function () {
		$location.path('/login');
	});
}]);
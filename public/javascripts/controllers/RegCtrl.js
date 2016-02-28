angular.module('Chat').controller('RegCtrl', ['$scope', '$location', '$rootScope', '$http', 'api', 'socket', function ($scope, $location, $rootScope, $http, api, socket) {
	$scope.user = {};

	$scope.save = function () {
		var fd = new FormData();
		console.log($('#avatar')[0].files[0]);
		fd.append('username', $scope.user.username);
		fd.append('password', $scope.user.password);
		fd.append('email', $scope.user.email);
		fd.append('avatar', $('#avatar')[0].files[0]);
		$.ajax({
			url:'/users/reg',
			method: 'POST',
			data: fd,
			processData: false,
			contentType: false
		}).success(function (user) {
			socket.connect();
			console.log('成功了');
			console.log(user);
			$rootScope.me = user;
			console.log($rootScope.me);
			$location.path('/');
			window.location.href = 'http://' + window.location.host + '/#/';
			console.log($location.path());
		}).error(function () {
			console.log('错误了');
			$location.path('/reg');
			window.location.href = 'http://' + window.location.host + '/#/reg';
		});
		//api.post('/users/reg', fd).success(function (user) {
		//	$rootScope.me = user;
		//	$location.path('/');
		//}).error(function () {
		//	$location.path('/reg');
		//});
	};

	$('#avatar').change(function () {
		var file = this.files[0];
		var fd = new FileReader();
		fd.readAsDataURL(file);

		fd.onload = function () {
			$('#avatarPreview').attr('src', this.result);
			$('#avatarPreview').css('display', 'inline-block');
		};
	});
}]);
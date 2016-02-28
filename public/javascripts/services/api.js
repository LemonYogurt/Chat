angular.module('Chat').factory('api', ['$http', function ($http) {
	return {
		host: '',
		get: function (url) {
			return $http({
				url: this.host + url,
				method: 'GET'
			});
		},
		post: function (url, data) {
			return $http({
				url: this.host + url,
				method: 'POST',
				data: data
			});
		}
	};
}]);
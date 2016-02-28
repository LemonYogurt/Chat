angular.module('Chat').directive('scrollToBottom', function () {
	return {
		link: function (scope, element, attrs) {
			scope.$watch(function () {
				return element.children().length;
			}, function () {
				element.animate({
					scrollTop: element.prop('scrollHeight')
				}, 1000);
			});
		}
	};
});
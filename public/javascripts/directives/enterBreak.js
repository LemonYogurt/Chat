angular.module('Chat').directive('enterBreak', function () {
	return function (scope, element, attrs) {
		var ctrlDown = false;
		element.bind('keydown', function (event) {
			/**
			 * ctrl键的keyCode是17
			 */
			if (event.which == 17) {
				ctrlDown = true;
				setTimeout(function () {
					ctrlDown = false;
				}, 1000);
			}

			/**
			 * enter键是13
			 */
			if (event.which == 13) {
				if (ctrlDown) {
					element.val(element.val() + '/n');
				} else {
					// 刷新视图
					scope.$apply(function () {
						// 这里就是调用enterBreak的方法
						scope.$eval(attrs.enterBreak);
					});
					event.preventDefault(); // 阻止默认事件
				}
			}
		});
	}
});
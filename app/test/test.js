var arr = [{username: 'liu'}, {username: '安佰梅'}];
console.log(indexOf(arr, {username: 'liu'}, 'username'));

console.log(arr.splice(indexOf(arr, {username: 'liu'}, 'username'), 1));

function indexOf(arr, obj, attr) {
	for (var i = 0; i < arr.length; i++) {
		if (obj[attr] == arr[i][attr]) {
			return i;
		}
	}
}
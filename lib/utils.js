/*
 * (C) 2013 chick307 <chick307@gmail.com>
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */

var unique = exports.unique = function unique() {
	var result = [], i = 0;
	var length = arguments.length, j, array, len, k, l;
	for (j = 0; j < length; j++) {
		array = arguments[j];
		len = array.length;
		for (k = 0; k < len; k++) {
			l = i;
			while (l--) {
				if (result[l] === array[k])
					break;
			}
			if (l === -1)
				result[i++] = array[k];
		}
	}
	return result;
};

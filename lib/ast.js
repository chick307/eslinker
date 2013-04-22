/*
 * (C) 2013 chick307 <chick307@gmail.com>
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */

var traverse = require('estraverse').traverse;


var getIds = exports.getIds = function getIds(ast) {
	var result = [], i = 0;
	traverse(ast, {
		enter: function(node) {
			if (node.type !== 'Identifier')
				return;
			var j = i, name = node.name;
			while (j--) {
				if (result[j] === name)
					return;
			}
			result[i++] = name;
		}
	});
	return result;
};


var getDeps = exports.getDeps = function getDeps(ast) {
	var result = [], i = 0;
	traverse(ast, {
		leave: function(node) {
			var path = getRequiredPath(node);
			if (path !== null)
				result[i++] = path;
		}
	});
	return result;
};


var getRequiredPath =
exports.getRequiredPath = function getRequriedPath(node) {
	if (node.type === 'CallExpression' &&
		node.callee.type === 'Identifier' &&
		node.callee.name === 'require' &&
		0 < node.arguments.length &&
		node.arguments[0].type === 'Literal' &&
		typeof node.arguments[0].value === 'string') {
		return node.arguments[0].value;
	}
	return null;
};


var wrap = exports.wrap = function wrap(ast) {
	if (ast == null) {
		return null;
	} else if (ast.type === 'Program') {
		return {
			type: 'Program',
			body: [
				{
					type: 'ExpressionStatement',
					expression: {
						type: 'CallExpression',
						callee: {
							type: 'FunctionExpression',
							id: null,
							params: [],
							body: {
								type: 'BlockStatement',
								body: ast.body
							}
						},
						arguments: []
					}
				}
			]
		};
	} else {
		return ast;
	}
};

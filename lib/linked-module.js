/*
 * (C) 2013 chick307 <chick307@gmail.com>
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */

var replace = require('estraverse').replace;
var parse = require('esprima').parse;
var getIds = require('./ast').getIds;
var getRequiredPath = require('./ast').getRequiredPath;

var TEMPLATE =
	'var $$$ = function() {' +
		'var $$$ = true;' +
		'var exports = {};'+
		'var module = {exports: exports};'+
		'return function() {' +
			'if ($$$) {' +
				'$$$ = false;' +
				'(function(module, exports) {' +
				'}.call(exports, module, exports));' +
			'}' +
			'return module.exports;' +
		'};' +
	'}();';



var LinkedModule = exports.LinkedModule = (function() {
	var ctor = function LinkedModule(mainModule) {
		if (!(this instanceof ctor))
			throw new TypeError('Constructor cannot be called as a function.');

		this._mainModule = mainModule;
		this._linked = [];
		this._ids = [];
	};

	var proto = ctor.prototype = {};
	proto.constructor = ctor;

	proto.getMainModule = function getMainModule() {
		return this._mainModule;
	};

	proto.getShebang = function getShebang() {
		return this._mainModule.getShebang();
	};

	proto.getSubmodules = function getSubmodules() {
		return this._linked.slice();
	};

	proto.link = function link(submodule) {
		if (this._linked.indexOf(submodule) !== -1)
			return;

		this._linked.push(submodule);

		var ids = this._ids, length = ids.length;
		getIds(submodule.ast).forEach(function(id) {
			var i = length;
			while (i--) {
				if (ids[i] === id)
					return;
			}
			ids[length++] = id;
		});
	};

	proto.toJSON = function toJSON() {
		var mainModule = this._mainModule;
		var counter = 1, ids = this._ids;
		var linked = this._linked.map(function(module) {
			do var id = '$$' + counter++; while (ids.indexOf(id) !== -1);
			return {module: module, id: id, used: false};
		});

		update(mainModule);
		linked.forEach(function(link) {
			update(link.module);
		});

		linked.reverse().forEach(function(link) {
			if (!link.used)
				return;

			var id = {type: 'Identifier', name: link.id};
			var ast = replace(parse(TEMPLATE), {
				leave: function(node) {
					if (node.type === 'Identifier' && node.name === '$$$')
						return id;
					if (node.type === 'BlockStatement' &&
						node.body.length === 0) {
						node.body = link.module.getAst().body;
						return node;
					}
				}
			}).body[0];

			var mainAst = mainModule.getAst();
			mainAst.body.unshift(ast);
		});

		return mainModule.getAst();

		function update(module) {
			replace(module.getAst(), {
				enter: function(node) {
					var path = getRequiredPath(node);
					if (path === null)
						return;

					var fullPath = module.resolve(path), link = null;
					linked.some(function(l) {
						if (l.module.getFullPath() !== fullPath)
							return false;
						link = l;
						l.used = true;
						return true;
					});

					if (link !== null) {
						return {
							type: 'CallExpression',
							callee: {type: 'Identifier', name: link.id},
							arguments: []
						};
					} else if (module !== mainModule &&
						/^\.\.?(\/.*)?$/.test(path)) {
						var literal = node.arguments[0];
						literal.value = mainModule.relative(fullPath);
						return node;
					}
				}
			});
		}
	};

	return ctor;
}());

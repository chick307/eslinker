/*
 * (C) 2013 chick307 <chick307@gmail.com>
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */

module.exports = function(grunt) {
	grunt.registerTask('mocha', 'Run tests with Mocha.', function(target) {
		var done = this.async();
		var name = this.name;
		var config = grunt.config(name);
		delete config.options;

		var options = this.options();
		if (target && config[target] && config[target].options)
			options = grunt.util._.defaults(config[target].options, options);

		var Mocha = require('mocha');
		var mocha = new Mocha(options);

		var targets = (target != null) ? [target] : Object.keys(config);
		targets.forEach(function(targetName) {
			this.requiresConfig(name + '.' + targetName);

			var cfg = config[targetName];
			if (cfg instanceof Array)
				cfg = {files: cfg};

			var files = grunt.file.expand(cfg.files);
			files.forEach(mocha.addFile.bind(mocha));
		}, this);

		mocha.run(function(errorCount) {
			done(errorCount === 0);
		});
	});
};

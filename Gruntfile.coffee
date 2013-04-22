module.exports = (grunt) ->
	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadTasks 'tasks'

	grunt.registerTask 'default', ['test']
	grunt.registerTask 'test', ['mocha']

	grunt.initConfig
		mocha:
			eslinker: ['test/eslinker-test.js']
			ast: ['test/ast-test.js']
			utils: ['test/utils-test.js']

		watch:
			eslinker:
				files: [
					'index.js'
					'lib/eslinker.js'
					'lib/linked-module.js'
					'lib/module.js'
					'test/eslinker-test.js'
				]
				tasks: ['mocha:eslinker']
			ast:
				files: ['lib/ast.js', 'test/ast-test.js']
				tasks: ['mocha:ast']
			utils:
				files: ['lib/utils.js', 'test/utils-test.js']
				tasks: ['mocha:utils']

'use strict';

/**
 * Dependencies.
 */
var matchdep = require('matchdep');

/**
 * Grunt configuration.
 */
module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
				' Licensed <%= pkg.license %> */\n'
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			files: ['Gruntfile.js', 'scripts/{,*/}*.js']
		},
		sass: {
			dev: {
				files: {
					'app.css': 'styles/app.scss'
				}
			}
		},
		browserify: {
			dev: {
				files: {
					'app.js': 'scripts/app.js'
				}
			}
		},
		connect: {
			options: {
				port: 3000,
				hostname: '*'
			},
			dev: {}
		},
		watch: {
			options: {
				livereload: true
			},
			scripts: {
				files: 'scripts/{,*/}*.js',
				tasks: ['jshint', 'browserify:dev']
			},
			styles: {
				files: 'styles/{,*/}*.scss',
				tasks: ['sass:dev']
			}
		}
	});

	// loads any npm grunt task
	matchdep.filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.registerTask('build', ['jshint', 'sass:dev', 'browserify:dev']);
	grunt.registerTask('default', ['build', 'connect', 'watch']);
};

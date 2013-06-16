/*global module:false,require:false,console:false */
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' +
			' <%= pkg.license %> License */\n',
		distFolder: 'web/dist/<%= pkg.version %>/',
		yaml: {
			file: 'web/_config.yml',
			vars: {
				url: 'http://localhost:4000',
				name: 'Web 3.0, 6 Bladed Razors, 7 Minute Abs',
				description: 'A web development blog written by @zachleat.',
				safe: false,
				auto: true,
				baseurl: '/web',
				markdown: 'rdiscount',
				// https://github.com/mojombo/jekyll/wiki/Permalinks
				permalink: '/web/:title/',
				pygments: true,
				distFolder: '/<%= distFolder %>'
			}
		},
		// Task configuration.
		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners: true
			},
			js: {
				src: ['web/js/initial.js'],
				dest: '<%= distFolder %>initial.js'
			}
		},
		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			js: {
				src: '<%= concat.js.dest %>',
				dest: '<%= distFolder %>initial.min.js'
			}
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				unused: true,
				boss: true,
				eqnull: true,
				browser: true,
				globals: {}
			},
			gruntfile: {
				src: 'Gruntfile.js'
			},
			js: {
				src: ['js/**/*.js']
			}
		},
		sass: {
			dist: {
				options: {
					style: 'expanded'
				},
				files: {
					'<%= distFolder %>global.css': ['web/css/buttsweater.scss', 'web/css/socialmenu.scss', 'web/css/thirdparty.scss', 'web/css/pygments.css'],
					'<%= distFolder %>icons.css': 'web/css/foundicons.scss'
				}
			}
		},
		cssmin: {
			dist: {
				options: {
					banner: '<%= banner %>'
				},
				files: {
					'<%= distFolder %>global.min.css': ['<%= distFolder %>global.css'],
					'<%= distFolder %>icons.min.css': ['<%= distFolder %>icons.css']
				}
			}
		},
		shell: {
			jekyll: {
				command: 'jekyll --no-auto',
				options: {
					stdout: true,
					execOptions: {
						cwd: 'web'
					}
				}
			},
			// generate the pygments css file
			pygments: {
				command: 'pygmentize -S default -f html > pygments.css',
				options: {
					stdout: true,
					execOptions: {
						cwd: 'web/css'
					}
				}
			}
		},
		watch: {
			assets: {
				files: ['web/css/**/*', 'web/js/**/*'],
				tasks: ['default']
			},
			content: {
				files: ['web/_posts/**/*', 'web/_layouts/**/*', 'web/speaking/**/*', 'web/projects/**/*', 'web/about/**/*', 'web/license/**/*', 'web/feed/**/*', 'web/index.html', 'web/_plugins/**/*', 'web/_includes/**/*' ],
				tasks: ['content']
			},
			config: {
				files: ['Gruntfile.js'],
				tasks: ['config']
			}
		}
	});

	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-contrib-sass' );
	grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
	grunt.loadNpmTasks( 'grunt-shell' );

	grunt.registerTask( 'yaml', function() {
		var output = grunt.config( 'yaml.file' ),
			vars = grunt.config( 'yaml.vars' ),
			fs = require('fs'),
			str = [ '# Autogenerated by `grunt config`' ];

		for( var j in vars ) {
			str.push( j + ': ' + vars[ j ] );
		}

		fs.writeFile( output, str.join( '\n' ), function(err) {
			if(err) {
				console.log(err);
			}
		}); 
	});

	grunt.registerTask( 'feedburner-size', function() {
		var feed = 'web/_site/feed/atom.xml',
			fs = require('fs');

		var stats = fs.statSync( feed ),
			kbSize = Math.ceil( stats.size / 1024 );

		if( kbSize > 512 ) {
			grunt.warn( 'Your atom.xml is too large (' + kbSize + 'KB) for Feedburner (512KB max).' );
		}
	});

	// Default task.
	grunt.registerTask('assets', ['sass', 'jshint', 'concat:js', 'uglify', 'cssmin']);
	grunt.registerTask('config', ['yaml']);
	grunt.registerTask('content', ['shell:jekyll', 'feedburner-size']);
	grunt.registerTask('default', ['config', 'assets', 'content']);

};

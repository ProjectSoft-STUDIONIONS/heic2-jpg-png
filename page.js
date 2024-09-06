module.exports = function(grunt){
	process.removeAllListeners('warning');
	require('dotenv').config();
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	var gc = {},
		pkg = grunt.file.readJSON('package.json'),
		path = require('path'),
		uniqid = function () {
			let result = URL.createObjectURL(new Blob([])).slice(-36).replace(/-/g, '');
			return result;
		};
	function getTasks() {
		switch(process.env.GRUNT_TASK){
			default:
				return [
					'imagemin',
					'less',
					'cssmin',
					'uglify',
					'pug',
					'copy'
				];
		}
	}
	grunt.initConfig({
		globalConfig : gc,
		pkg : pkg,
		imagemin: {
			base: {
				options: {
					optimizationLevel: 3,
					svgoPlugins: [
						{
							removeViewBox: false
						}
					]
				},
				files: [
					{
						expand: true,
						flatten : true,
						src: [
							'src/page/images/*.{png,jpg,gif}'
						],
						dest: 'docs/images/',
						filter: 'isFile'
					}
				],
			}
		},
		copy: {
			main: {
				files: [
					{
						expand: true,
						cwd: "application",
						src: "*.ico",
						dest: "docs/"
					},
					{
						expand: true,
						cwd: `application`,
						src: "*.png",
						dest: "docs/"
					},
				]
			}
		},
		less: {
			main: {
				options : {
					compress: false,
					ieCompat: false
				},
				files: {
					'tests/css/main.css': [
						
						'src/page/less/main.less'
					],
				}
			}
		},
		cssmin: {
			options: {
				mergeIntoShorthands: false,
				roundingPrecision: -1
			},
			minify: {
				files: {
					'docs/css/main.css' : [
						'tests/css/main.css'
					],
				}
			}
		},
		pug: {
			files: {
				options: {
					pretty: '\t',
					separator:  '\n',
					data: function(dest, src) {
						return {
							"hash": uniqid(),
							"repo": "projectsoft-studionions.github.io",
							"userName": "ProjectSoft-STUDIONIONS",
							"page": "heic2-jpg-png",
							"download": "ConverterHeic2JpgPng-Setup.exe",
							"title": "Конвертор heic в jpg или png | ProjectSoft GitHub Pages",
							"h1title": "Конвертор heic в jpg или png",
							"description": "Приложение для конвертирования heic изображений в изображения jpg или png",
							"keywords": "ProjectSoft, STUDIONIONS, ProjectSoft-STUDIONIONS, heic, jpg, png, heic в jpg, heic в png",
							"nickname": "ProjectSoft",
							"logotype": "projectsoft.png",
							"copyright": "2008 - all right reserved",
							"open_graph": {
								"image_16x9": "application.png",
								"image_16x9_width": "499",
								"image_16x9_height": "392",
								"image_1x1": "application.png",
								"image_1x1_width": "499",
								"image_1x1_height": "392",
							}
						}
					}
				},
				files: {
					"docs/index.html": ['src/page/index.pug'],
				}
			}
		},
		uglify : {
			options: {
				ASCIIOnly: true,
			},
			main: {
				files: {
					'docs/js/main.js': [
						'src/page/js/main.js'
					]
				}
			},
		},
	});
	grunt.registerTask('default', getTasks());
}
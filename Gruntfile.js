module.exports = function(grunt) {
	process.removeAllListeners('warning');
	require('dotenv').config();

	// target=false - nwjs sdk = nortmal
	// target=true - nwjs sdk = sdk
	// update=true - произвести скачивание nwjs и ffmpeg
	// update=false - не производить скачивание nwjs и ffmpeg
	// В корне проекта присутствие файла .env обязятельно
	// Параметры NWJS_TARGET и NWJS_UPDATE должны быть заданы. 
	// При первом запуске или смене SDK NWJS_UPDATE должен быть равен 1
	// NWJS_VERSION должен содержать номер нужной версии или 0 для загрузки последней

	const target = process.env.NWJS_TARGET === '1' ? true : false,
		update = process.env.NWJS_UPDATE === '1' ? true : false,
		version = process.env.NWJS_VERSION === '0' ? false : process.env.NWJS_VERSION, // 0.84.0
		tasksType = grunt.option('build') || 'test';

	grunt.loadNpmTasks('innosetup-compiler');

	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);
	require('./modules/Downloader.js')(grunt);
	require('./modules/Build.js')(grunt);
	require('./modules/Versions.js')(grunt);

	const path = require('path'),
		uniqid = function () {
			let result = URL.createObjectURL(new Blob([])).slice(-36).replace(/-/g, "");
			return result;
		},
		hash = uniqid();

	//console.log(hash);

	var gc = {
			sdk: target ? 'sdk' : 'normal',
			version: version
		},
		flv = target ? '-sdk' : '',
		pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({
		globalConfig: gc,
		pkg: pkg,
		clean: {
			options: {
				force: true
			},
			all: [
				"build/**/*",
				"install/**/*",
				"*-lock.json",
				'application/css/',
				'application/fonts/',
				'application/js/',
				'application/*-lock.json',
				'application/*.sublime-*',
				'test/'
			],
			vk: [
				'build/vk_*',
				'build/vulkan*',
				'build/swiftshader',
				'build/locales/*.info'
			],
		},
		copy: {
			main: {
				files: [
					{
						expand: true,
						cwd: "src/fonts",
						src: "**",
						dest: "application/fonts/"
					},
					{
						expand: true,
						cwd: `.cache/${gc.sdk}`,
						src: "**",
						dest: "build/"
					},
				]
			}
		},
		less: {
			main: {
				options: {
					compress: false,
					ieCompat: false,
					plugins: [
						
					],
					modifyVars: {
						"hash": hash,
						"icomoon-font-path": "ConvertHeic",
						"icomoon-font-path": "/fonts",
					}
				},
				files: {
					'test/css/main.css': [
						'src/less/main.less'
					],
				}
			},
		},
		cssmin: {
			options: {
				mergeIntoShorthands: false,
				roundingPrecision: -1
			},
			main: {
				files: {
					'application/css/main.css': [
						'test/css/main.css'
					]
				}
			},
		},
		concat: {
			options: {
				separator: ';',
			},
			main: {
				src: [
					'src/js/main.js',
				],
				dest: 'test/js/concat.js',
			},
		},
		uglify : {
			options: {
				ASCIIOnly: true,
				compress: false,
				//beautify: true
			},
			main: {
				files: {
					'application/js/main.js': [
						'test/js/concat.js',
					],
				},
			},
		},
		pug: {
			main: {
				options: {
					doctype: 'html',
					pretty: '',// '\t',
					separator: '',// '\n'
					data: function(dest, src) {
						return {
							"hash": hash,
							"target": gc.sdk,
						}
					},
				},
				files: {
					"application/index.html": ['src/pug/index.pug'],
				},
			},
		},
		version_edit: {
			main: {
				options: {
					pkg: pkg,
				}
			}
		},
		downloader: {
			main: {
				options: {
					version: gc.version,
					sdk: gc.sdk == 'normal' ? false : true
				}
			}
		},
		zip: {
			main: {
				router: function (filepath) {
					return filepath.split('/').slice(1).join('/');
				},
				src: ["application/**/*"],
				dest: 'build/package.nw'
			}
		},
		unzip: {
			unzip_001: {
				router: function (filepath) {
					return filepath.split('/').slice(1).join('/');
				},
				src: `.cache/${gc.sdk}.zip`,
				dest: `.cache/${gc.sdk}/`
			},
			unzip_002: {
				src: `.cache/ffmpeg.zip`,
				dest: `.cache/${gc.sdk}/`
			},
		},
		buildnw: {
			main: {}
		},
		innosetup: {
			main: {
				options: {
					gui: false,
					verbose: true,
				},
				script: __dirname + "/innosetup.iss"
			}
		},
	});
	const tasks = [
		'clean:all',
		'concat',
		'uglify',
		'less',
		'cssmin',
		'pug',
	];

	update && tasks.push('downloader');

	tasks.push( 'unzip', 'version_edit', 'copy', 'zip', 'clean:vk', 'buildnw');

	// Таск для запуска innosetup
	// Клонируем Таск по умолчанию
	const inno = JSON.parse(JSON.stringify(tasks));
	// Добавляем запуск innosetup
	inno.push('innosetup');

	console.table({
		"ПЛАТФОРМА": target ? "sdk" : "normal",
		"ВЕРСИЯ": version ? version : "latests",
		"ОБНОВЛЕНИЕ": update ? "ДА" : "ИЗ КЭША",
		"ВРЕМЯ СТАРТА": grunt.template.date(new Date().getTime(), 'yyyy-mm-dd HH:MM:ss Z')
	});

	// Регистрируем таск
	grunt.registerTask('default', tasksType == 'test' ? tasks : (tasksType == 'compile' ? inno : tasks));
}
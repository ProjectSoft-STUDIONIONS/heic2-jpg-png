module.exports = function(grunt) {
	const fs = require("fs");
	const path = require("path");

	grunt.registerMultiTask('version_edit', 'Version Update', async function() {
		var done = this.async();
		const pkg = this.options().pkg || {
			version: '1.0.0',
			comments: '',
			description: ''
		};

		grunt.file.write("version.iss", `#define VersionApp "${pkg.version}"`);
		let versApp = grunt.file.readJSON('application/package.json');
		versApp.version = pkg.version;
		versApp.comments = pkg.comments;
		versApp.description = pkg.description;
		let str = JSON.stringify(versApp, null, "\t");
		grunt.file.write("application/package.json", `${str}`);
		grunt.file.copy("LICENSE", "application/LICENSE");
		done();
	});
};
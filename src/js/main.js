!(async function(){
	let win = nw.Window.get();
	const sdk = (nw.process.versions["nw-flavor"] == "sdk");
	const startPath = nw.App.startPath;

	// Opening DevTools with nw-flavor SDK
	sdk && win.showDevTools();

	let inputValue = "",
		outputValue = "",
		selectValue = "";

	const fs = require('fs'),
		path = require('path'),
		{ promisify } = require('util'),
		{ spawn } = require('child_process'),
		fse = require('fs-extra'),
		convert = require('heic-convert'),
		nwDialog = require('nw-dialog'),
		magick = path.join(startPath, 'imagemagick', 'magick.exe');
	// nw-dialog context set document
	nwDialog.setContext(document);
		// Input
	const input = document.querySelector('#input'),
		btnInput = document.querySelector('#btn-input'),
		// Output
		output = document.querySelector('#output'),
		btnOutput = document.querySelector('#btn-output'),
		// Select and convert
		select = document.querySelector('#select'),
		btnConvert = document.querySelector('#btn-convert'),
		// Progress and Open
		progressWrapp = document.querySelector('.progress-wrap'),
		progressTitle = document.querySelector('.progress-bar-title'),
		progress = document.querySelector('#progress'),
		btnOpen = document.querySelector('#btn-open'),
		// check if directory exists
		checkIfDirectoryExists = function (dirPath) {
			return new Promise(async (resolve, reject) => {
				sdk && console.log(dirPath);
				try {
					const exists = await fse.pathExists(dirPath);
					if (exists) {
						sdk && console.log("The directory exists \n" + dirPath);
						resolve(dirPath);
					} else {
						sdk && console.log("The directory does NOT exist \n" + dirPath);
						try {
							await fse.ensureDir(dirPath);
							sdk && console.log("The directory success! \n" + dirPath);
							resolve(dirPath);
						} catch (err) {
							sdk && console.error(dirPath, err);
							reject("");
						}
					}
				} catch (err) {
					sdk && console.error(err.message  + "\n" + dirPath);
					reject("");
				}
			});
		},
		startConversion = function(inputVal, outputVal, selectVal = 'jpg'){
			return new Promise(async (resolve, reject) => {
				let inputValDir = "",
					outputValDir = "";
				inputValDir = await checkIfDirectoryExists(inputVal).catch(e => {
					sdk && console.error(e);
					reject(e);
				});
				outputValDir = await checkIfDirectoryExists(outputVal).catch(e => {
					sdk && console.error(e);
					reject(e);
				});
				resolve();
			});
		},
		disableElements = function(){
			// input.setAttribute('disabled', 'disabled');
			// output.setAttribute('disabled', 'disabled');
			select.setAttribute('disabled', 'disabled');
			btnInput.setAttribute('disabled', 'disabled');
			btnOutput.setAttribute('disabled', 'disabled');
			btnConvert.setAttribute('disabled', 'disabled');
			progressWrapp.classList.remove('hidden');
			btnOpen.classList.add('hidden');
		},
		enabledElements = function(){
			// input.removeAttribute('disabled');
			// output.removeAttribute('disabled');
			select.removeAttribute('disabled');
			btnInput.removeAttribute('disabled');
			btnOutput.removeAttribute('disabled');
			btnConvert.removeAttribute('disabled');
			progressWrapp.classList.add('hidden');
			btnOpen.classList.remove('hidden');
		};

	// Button Input folder
	btnInput.addEventListener('click', e => {
		e.preventDefault();
		nwDialog.folderBrowserDialog(function(result) {
			inputValue = input.value = result;
			progressWrapp.classList.remove('hidden');
			btnOpen.classList.add('hidden');
		});
		return !1;
	});
	// Button Output Folder
	btnOutput.addEventListener('click', e => {
		e.preventDefault();
		nwDialog.folderBrowserDialog(function(result) {
			outputValue = output.value = result;
			progressWrapp.classList.remove('hidden');
			btnOpen.classList.add('hidden');
		});
		return !1;
	});
	// File Type Result Selection
	select.addEventListener('input', e => {
		e.preventDefault();
		progressWrapp.classList.remove('hidden');
		btnOpen.classList.add('hidden');
		selectValue = select.value;
		return !1;
	});
	// Button Start Conversion
	btnConvert.addEventListener('click', e => {
		e.preventDefault();
		// Start function Conversion
		startConversion(inputValue, outputValue, selectValue).then(async () => {
			sdk && console.log("START");
			disableElements();
			let files = fs.readdirSync(inputValue).filter(fn => fn.endsWith('.heic')),
				typeFile = "JPEG",
				ext = ".jpg",
				index;
			switch(selectValue){
				case "png":
					typeFile = "PNG"
					ext = ".png"
					break;
			}
			for(index in files){
				let perc = index / (files.length - 1);
				progress.value = perc * 100;
				progressTitle.innerText = parseInt(progress.value) + '%';
				try {
					let name = path.parse(files[index]).name + ext,
						outputFile = path.join(outputValue, name),
						file = path.join(inputValue, files[index]);
						inputBuffer = await promisify(fs.readFile)(file),
						outputBuffer = await convert({
							buffer: inputBuffer,
							format: typeFile,
							quality: 1
						});
					await promisify(fs.writeFile)(path.join(outputValue, name), outputBuffer);
				}catch(err){
					sdk && console.error(err);
				}
			}
			await enabledElements();
			progress.value = 0;
		}).catch(err => {
			sdk && console.error(err);
			enabledElements();
			progressWrapp.classList.remove('hidden');
			btnOpen.classList.add('hidden');
			progress.value = 0;
			progressTitle.innerText = '';
		});
		return !1;
	});
	// Btn Open Output Folder
	btnOpen.addEventListener('click', e => {
		e.preventDefault();
		if(output.value) {
			nw.Shell.openItem(output.value)
		}
		return !1;
	});
	document.body.addEventListener('dragover', function(e){
		e.preventDefault();e
		e.stopPropagation();
		return !1;
	}, false);
	document.body.addEventListener('drop', function(e){
		e.preventDefault();
		e.stopPropagation();
		return !1;
	}, false);
	Array.from(document.querySelectorAll('a')).forEach((el, ind, elms) => {
		el.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			let element = e.target,
				href = element.href;
			nw.Shell.openExternal(href);
			return !1;
		})
	});
	progress.value = 0;
	progressTitle.innerText = '';
})();
!(async function(){
	let win = nw.Window.get();
	const sdk = (nw.process.versions["nw-flavor"] == "sdk");
	const startPath = nw.App.startPath;

	// Opening DevTools with nw-flavor SDK
	sdk && win.showDevTools();

	let inputValue = "",
		outputValue = "",
		selectValue = "";

	const fs = require('node:fs'),
		path = require('node:path'),
		{ promisify } = require('node:util'),
		fse = require('fs-extra'),
		convert = require('heic-convert'),
		nwDialog = require('nw-dialog');
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
		progress = document.querySelector('#progress'),
		btnOpen = document.querySelector('#btn-open'),
		// check if directory exists
		checkIfDirectoryExists = function (dirPath) {
			return new Promise(async (resolve, reject) => {
				console.log(dirPath);
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
					sdk && console.log(err.message  + "\n" + dirPath);
					reject("");
				}
			});
		},
		startConversion = function(inputVal, outputVal, selectVal = 'jpg'){
			return new Promise(async (resolve, reject) => {
				let inputValDir = "",
					outputValDir = "";
				inputValDir = await checkIfDirectoryExists(inputVal).catch(e => {
					sdk && console.log(e);
					reject(e);
				});
				outputValDir = await checkIfDirectoryExists(outputVal).catch(e => {
					sdk && console.log(e);
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
			progress.classList.remove('hidden');
			btnOpen.classList.add('hidden');
		},
		enabledElements = function(){
			// input.removeAttribute('disabled');
			// output.removeAttribute('disabled');
			select.removeAttribute('disabled');
			btnInput.removeAttribute('disabled');
			btnOutput.removeAttribute('disabled');
			btnConvert.removeAttribute('disabled');
			progress.classList.add('hidden');
			btnOpen.classList.remove('hidden');
		};

	// Button Input folder
	btnInput.addEventListener('click', e => {
		e.preventDefault();
		nwDialog.folderBrowserDialog(function(result) {
			inputValue = input.value = result;
			progress.classList.remove('hidden');
			btnOpen.classList.add('hidden');
		});
		return !1;
	});
	// Button Output Folder
	btnOutput.addEventListener('click', e => {
		e.preventDefault();
		nwDialog.folderBrowserDialog(function(result) {
			outputValue = output.value = result;
			progress.classList.remove('hidden');
			btnOpen.classList.add('hidden');
		});
		return !1;
	});
	// File Type Result Selection
	select.addEventListener('input', e => {
		e.preventDefault();
		progress.classList.remove('hidden');
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
				try {
					let name = path.parse(files[index]).name + ext,
						file = path.join(inputValue, files[index]),
						inputBuffer = await promisify(fs.readFile)(file),
						outputBuffer = await convert({
							buffer: inputBuffer,
							format: typeFile,
							quality: 1
						});
					await promisify(fs.writeFile)(path.join(outputValue, name), outputBuffer);
				}catch(err){
					sdk && console.log(err);
				}

				progress.value = (index / (files.length - 1)) * 100;
			}
			await enabledElements();
			progress.value = 0;
		}).catch(err => {
			sdk && console.log(err);
			enabledElements();
			progress.classList.remove('hidden');
			btnOpen.classList.add('hidden');
			progress.value = 0;
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
})();
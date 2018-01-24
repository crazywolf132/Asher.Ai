var exports = (module.exports = {});
const fs = require("fs");
const path = require("path");
exports.fileToArray = (file, list) => {
	const array = fs
		.readFileSync(file)
		.toString()
		.split("\n");
	for (let i = 0; i < array.length; i++) {
		list.push(array[i]);
	}
};

exports.findFilesAndFolders = (
	_path,
	_list,
	returnNamesOnly,
	checkForDir,
	checkForFile
) => {
	fs.readdirSync(_path).forEach(file => {
		if (checkForDir && !checkForFile) {
			if (fs.statSync(_path + file).isDirectory()) {
				if (returnNamesOnly) {
					_list.push(file);
				} else {
					_list.push(_path + file);
				}
			}
		} else if (!checkForDir && checkForFile) {
			if (fs.statSync(_path + file).isFile()) {
				_list.push(_path + file);
			}
		} else {
			if (returnNamesOnly) {
				_list.push(file);
			} else {
				_list.push(_path + file);
			}
		}
	});
};

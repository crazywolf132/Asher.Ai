var exports = (module.exports = {});
const fs = require("fs");
const path = require("path");
exports.fileToArray = (file, list) => {
	const array = fs
		.readFileSync(file)
		.toString()
		.split("\n");
	for (let i = 0; i < array.length; i++) {
		if (array[i] !== ""){
			list.push(array[i]);
		}
	}
};

exports.fileExists = (file) => {

	return (fs.existsSync(file) ? true : false);

}

exports.getFileLine = (file, line) => {
	const array = fs
		.readFileSync(file)
		.toString()
		.split("\n");
	return array[(line-1)];
}

exports.arrayToFile = (file, array) => {
	var holder = "";
	array.forEach((item) => {
		holder += item + "\n";
	})
	fs.writeFileSync(file, holder);
}

exports.arraytoDict = (file, dictionary) => {
	console.log("Running the file maker...")
	var holder = "";
	Object.keys(dictionary).forEach((key) => {
		holder += "BEGIN\n"
		holder += key + "\n";
		Object.keys(dictionary[key]).forEach((item) => {
			holder += item + " : " + dictionary[key][item];
		})
		holder += "END\n"
	})
	fs.writeFileSync(file, holder);
}

exports.fileToDict = (file, dictionary) => {
	const array = fs.readFileSync(file).toString().split("\n")
	var beginStatus = false;
	var endStatus = false;
	lastID = "";
	for (var i = 0; i < array.length; i++) {
		if (array[i] === 'BEGIN') {
			beginStatus = true;
			endStatus = false;
		} else if (array[i] === 'END') {
			beginStatus = false;
			endStatus = true;
		}

		if (beginStatus) {
			if (lastID === "") {
				//That means that this line is the id...
				//as it has gone past the begin status and there is no id set.
				lastID = array[i]
				dictionary[lastID] = {}
			} else {
				// We now need to split the line to a holder... so we get the key and value.
				var holder = array[i].split(" : ")
				if (holder[1] === "BLANK") {
					dictionar[lastID][holder[0]] = [];
				} else {
					// holder[0] will be the key.... holder[1] will be the value.
					dictionary[lastID][holder[0]] = holder[1]
				}
			}
		}
	}
}

exports.findFilesAndFolders = (
	_path,
	_list,
	returnNamesOnly,
	checkForDir,
	checkForFile
) => {
	fs.readdirSync(_path).forEach((file) => {
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

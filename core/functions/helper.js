var exports = (module.exports = {});

import { readFileSync, existsSync, writeFileSync, readdirSync, statSync } from "fs";
import path from "path";

export function fileToArray(file, list) {
	const array = readFileSync(file)
		.toString()
		.split("\n");
	for (let i = 0; i < array.length; i++) {
		if (array[i] !== ""){
			list.push(array[i]);
		}
	}
}

export function fileExists(file) {

	return (existsSync(file) ? true : false);

}

export function getFileLine(file, line) {
	const array = readFileSync(file)
		.toString()
		.split("\n");
	return array[(line-1)];
}

export function arrayToFile(file, array) {
	var holder = "";
	array.forEach((item) => {
		holder += item + "\n";
	})
	writeFileSync(file, holder);
}

export function changeModEnabled(mod) {
	console.log("Changing mod")
	var holder = [];
	fileToArray(mod, holder);
	holder[holder.length - 1] = 'false';
	arrayToFile(mod, holder);
}

export function arraytoDict(file, dictionary) {
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
	writeFileSync(file, holder);
}

export function dictToFile(file, dictionary) {
	writeFileSync(file, JSON.stringify(dictionary, null, 2));
}

export function fileToDict(file, dictionary) {
	const array = readFileSync(file).toString().split("\n")
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

export function findFilesAndFolders(
	_path,
	_list,
	returnNamesOnly,
	checkForDir,
	checkForFile
) {
	readdirSync(_path).forEach((file) => {
		if (checkForDir && !checkForFile) {
			if (statSync(_path + file).isDirectory()) {
				if (returnNamesOnly) {
					_list.push(file);
				} else {
					_list.push(_path + file);
				}
			}
		} else if (!checkForDir && checkForFile) {
			if (statSync(_path + file).isFile()) {
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
}

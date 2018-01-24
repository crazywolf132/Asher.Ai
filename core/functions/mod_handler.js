var exports = (module.exports = {});
const path = require("path");
const fs = require("fs");
const findFilesAndFolders = require("./helper").findFilesAndFolders;
const fileToArray = require("./helper").fileToArray;
const logger = require(process.cwd() + "/server").logger;

exports.mods = mods = [];

exports.trainAllMods = () => {
	findFilesAndFolders(process.cwd() + "/mods/", mods, true, true, false);
	mods.forEach((item) => {
		let holder = [];
		findFilesAndFolders(
			process.cwd() + "/mods/" + item + "/",
			holder,
			false,
			false,
			true
		);
		holder.forEach((file) => {
			if (file === process.cwd() + "/mods/" + item + "/words.txt") {
				teach(process.cwd() + "/mods/" + item + "/words.txt", item);
			}
		});
	});
	logger("Normal", "Only found" + mods.length + "mods");
};

exports.loadAllMods = (_all_Mods, _dict, loadType) => {
	findFilesAndFolders(process.cwd() + "/mods/", mods, true, true, false);
	mods.forEach((mod) => {
		let holder = [];
		findFilesAndFolders(
			process.cwd() + "/mods/" + mod + "/",
			holder,
			false,
			false,
			true
		);
		holder.forEach((file) => {
			if (file === process.cwd() + "/mods/" + mod + "/mod.js") {
				_all_Mods[mod] = require(process.cwd() + "/mods/" + mod + "/mod.js");
			}
			if (loadType) {
				if (file === process.cwd() + "/mods/" + mod + "/type.txt") {
					_gotType = [];
					fileToArray(file, _gotType);
					_dict[mod] = _gotType[0];
				}
			}
		});
	});
};

exports.getMod = (_mods, _modTypes, _questionType, _msg) => {
	let holdme = "";
	let _sentence;

	_mods.forEach((mod) => {
		if (_modTypes[mod] === _questionType) {
			_ins = [];
			fileToArray(process.cwd() + "/mods/" + mod + "/words.txt", _ins);
			_ins.forEach((_sentence) => {
				_sentence = _sentence.replace(/\r?\n?/gm, "");
				_sentence.trim();
				let result = nlp(_msg).match(_sentence).found;
				if (result) {
					holdme = mod;
				}
			});
		}
	});
	return holdme;
};

var exports = (module.exports = {});
const path = require("path");
const fs = require("fs");
const findFilesAndFolders = require("./helper").findFilesAndFolders;
const fileToArray = require("./helper").fileToArray;
const getFileLine = require("./helper").getFileLine;
const updateMod = require("./helper").changeModEnabled;
const logger = require(process.cwd() + "/server").logger;

exports.mods = mods = [];

exports.newLoadMods = (modsDB) => {

	findFilesAndFolders(process.cwd() + "/mods/", mods, true, true, false);
	mods.forEach((item) => {
		if (!(item in Object.keys(modsDB))) {
			var holder = [];
			var regex = [];
			var tempPath = process.cwd() + `/mods/${item}/`;
			try {
				modsDB[item] = [];
				fileToArray(`${tempPath}words.txt`, regex);
				modsDB[item].regex = regex;
				modsDB[item].import = require(process.cwd() + `/mods/${item}/mod.js`);
				getFileLine(tempPath + "info.mod", 4) == 'true' ? modsDB[item].enabled = true : modsDB[item].enabled = false;
				modsDB[item].isTheOne = (inputPhrase) => {
					var found = false;
					modsDB[item].regex.forEach((phrase) => {
						if (nlp(inputPhrase).match(phrase).found) {
							found = true;
						}
					})
					return found;
				}
			} catch (error) {
				updateMod(tempPath + "info.mod");
			// This is just incase someone was stupid and forgot a file... at that point...
			// we can do 1 of 2 things... If the brain is set to developer mode, we will keep the
			// mod, if it isnt set to developer mode... it will delete it and push a git update... as
			// it can potentially cause more errors.

			// Another way we can do it... is by setting an active tag. If the active tag isnt set to
			// true... then we leave it.
			// Though, with this approach we could encounter the problem of. The developer forgot the info
			// file, and that is what is causing this mess... This will just have to be decided at a latter stage
			// as to what path to take.

			// Personally, i think we should delete it. - Crazywolf132.
			}
		}
	})

}

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

exports.latestGetMod = (DB, message) => {
	var theMod = "";
	Object.keys(DB).forEach((mod) => {
		if (DB[mod].enabled){
			var result = DB[mod].isTheOne(message);
			if (result) {
				theMod = mod;
			}
		}
	});

	return theMod;
}


exports.getMod = (DB, type, message) => {
	var theMod = "";
	Object.keys(DB[type]).forEach((mod) => {
		DB[type][mod].regex.forEach((sentance) => {
			var sentence = _sentence.replace(/\r?\n?/gm, "");
			sentence.trim();
			var result = nlp(message).match(sentence).found;
			if (result){
				theMod = mod;
			}
		});
	});
	if ( theMod === "" && type !== "other" ) {
		//This means that we still for some reason have not found the mod...
		exports.getMod(DB, "other", message);
	} else if ( theMod === "" && type === "other" ) {
		// We are going to return "none", so then we can work out what to do latter.
		return "other"
	} else {
		return theMod;
	}
}

/*exports.getMod = (_mods, _modTypes, _questionType, _msg) => {
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
*/
var exports = (module.exports = {});
import path from "path";
import fs from "fs";
import { findFilesAndFolders } from "./helper";
import { fileToArray } from "./helper";
import { getFileLine } from "./helper";
import { changeModEnabled as updateMod } from "./helper";
const logger = require(process.cwd() + "/server").logger;

export const mods = mods = [];

export function newLoadMods(modsDB) {

	findFilesAndFolders(process.cwd() + "/mods/", mods, true, true, false);
	mods.forEach((item) => {
		if (!(item in Object.keys(modsDB))) {
			var holder = [];
			var regex = [];
			var tempPath = process.cwd() + `/mods/${item}/`;
			try {

				modsDB[item] = [];
				if (!(item == "talking")) {
					fileToArray(`${tempPath}words.txt`, regex);
					modsDB[item].regex = regex;
					
					modsDB[item].isTheOne = (inputPhrase) => {
						var found = false;
						modsDB[item].regex.forEach((phrase) => {
							if (nlp(inputPhrase).match(phrase).found) {
								found = true;
							}
						})
						return found;
					}
				}
				modsDB[item].import = require(process.cwd() + `/mods/${item}/mod.js`);
				getFileLine(tempPath + "info.mod", 4) == 'true' ? modsDB[item].enabled = true : modsDB[item].enabled = false;
				
			} catch (error) {
				console.log(error);
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

export function trainAllMods() {
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
}

export function getMod(DB, message) {
	var theMod = "";
	Object.keys(DB).forEach((mod) => {
		if (DB[mod].enabled) {
			var result = DB[mod].isTheOne(message);
			if (result) {
				theMod = mod;
			}
		}
	});

	if (theMod == "" || theMod == "knowledge") {
		// First we are going to see this exists in the active memory. (if it contains a who, what, when, where, or why) question.
		// We are now going to run the chat module... if we dont have a response in that...
		// we are going to then run the knowledge module...
		theMod = "talking";
		console.log("Ran here...")
	}

	return theMod;
}

export function latestGetMod(DB, message) {
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
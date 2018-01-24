module.exports = async function(subject, message, socket, socketUsed) {
	//const handler = require('../server')
	// We now need to create sub modules... so then we can
	// create a natural language response... So then we dont
	// need to have a specific module for each single common
	// response.
	const mod_helper = require(`${process.cwd()}/core/functions/helper`);
	const findFilesAndFolders = mod_helper.findFilesAndFolders;
	const memeory = require(`${process.cwd()}/server`).memeory;
	const remember = require(`${process.cwd()}/server`).remember;
	const core = require(`${process.cwd()}/server`);
	const allSubMods = {};
	//Find every module folder... go into it... check for the mod.js file,
	//load the words.txt file... check if any of those match the `message` input...
	const subMods = [];
	findFilesAndFolders(`./mods/casual/`, subMods, true, true, false);

	if (socketUsed) {
		socketID = socket.id;
		result = memeory(socketID);
		if (result === "false") {
			return await working(allSubMods, subject, message, socket, subMods, core);
		} else {
			// We are just going to assume that there should be a '/' as
			// all submodules need to remember their master module in the memeory
			// eg. `casual/goodDay`
			let holder = result.split("/");
			// The submodule to run should be the last item in the split...
			var name = holder[1];
			return await continueModule(
				allSubMods,
				subject,
				message,
				socket,
				name,
				core
			);
		}
	} else {
		return await working(allSubMods, subject, message, socket, subMods, core);
	}
};
async function continueModule(
	allSubMods,
	subject,
	message,
	socket,
	name,
	core
) {
	return new Promise(resolve => {
		allSubMods[name] = require(`./` + name + `/mod.js`);
		let toRun = allSubMods[name];
		let result = toRun(subject, message, socket, core, true);
		resolve(result);
	});
}
async function working(allSubMods, subject, message, socket, subMods, core) {
	const findFilesAndFolders = require(`${process.cwd()}/core/functions/helper`)
		.findFilesAndFolders;
	const fileToArray = require(`${process.cwd()}/core/functions/helper`)
		.fileToArray;
	return new Promise(resolve => {
		subMods.forEach(item => {
			const holder = [];
			findFilesAndFolders(`./mods/casual/${item}/`, holder, false, false, true);
			holder.forEach(file => {
				if (file === `./mods/casual/${item}/mod.js`) {
					allSubMods[item] = require(`./` + item + `/mod.js`);
				} else if (file === `./mods/casual/${item}/words.txt`) {
					//We are just going to assume there is a responses.txt file...
					const wordsHolder = [];
					fileToArray(`./mods/casual/${item}/words.txt`, wordsHolder);
					wordsHolder.forEach(sentence => {
						if (nlp(message).match(sentence).found) {
							core.logger("INFO", "Going to run the sub-module: " + item);
							const res = [];
							var toRun = allSubMods[item];
							let result = toRun(subject, message, socket, core, false);
							resolve(result);
						}
					});
				}
			});
		});
	});
}

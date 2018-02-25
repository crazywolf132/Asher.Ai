module.exports = async (subject, message, socket, socketUsed) => {
	const core = require(process.cwd() + "/server");
	const memory = core.addActiveMemory;
	const brain = core.activeMemory;
	const brainAssociations = require(process.cwd() +
		"/core/app/brain_associations");

	var temp_results = { sentence_id: "", sentence: "", weight: "" };

	// This should be getting the association from the asher response and
	// this message...
	let words = get_words(message);
	// This should be the last message from asher...
	let holder = message.split(" ");
	let words_length = holder.length;
	let sentenceID = get_id(message);

	Object.keys(words).forEach((key) => {
		let wordID = get_id("word", key);
		let recordedWeight = Math.sqrt(words[key] / words_length);

		var Item = new brainAssociations({
			word_id: wordID,
			sentance_id: sentenceID,
			weight: recordedWeight,
		});
		Item.save((err) => {
			if (err) throw err;
		});
	});

	words = get_words(message);
	holder = message.split(" ");
	words_length = holder.length;
  Object.keys(words).forEach((key) => {
    let recordedWeight = Math.sqrt(words[key] / words_length);
    temp_results.sentence_id = associations.
  })

	// There was 3 ways of doing this. Dont use sockets... therefore, the brain
	// cant learn. Use sockets, but then people requesting from the API cant use
	// this module. Or, make it so the sockets teach the brain, API only gets responses.
	// ... I chose the last option... i can always change it.
	if (socketUsed) {
		// This means that we have had a conversation with the user.
		if (brain[socket.id]["chatUsed"]) {
			prev = brain[socket.id]["LastMessage"];
		}
	} else {
		console.log("This part isnt done... this is just here to stop errors.");
	}
};

async function get_id(entityName, text) {
	const brainWords = require(process.cwd() + "/core/app/brain_words");
	const brainSentances = require(process.cwd() + "/core/app/brain_sentences");

	if (entityName === "word") {
		brainWords.findOne({ word: text }, function(err, item) {
			if (err) {
				console.log("There was an error getting item from db.");
			}
			if (item) {
				return item.id;
			} else {
				return addItemAndReturnID(brainWords, "word", text);
			}
		});
	}
	if (entityName === "sentence") {
		brainSentances.findOne({ sentence: text }, function(err, item) {
			if (err) console.log("There was an error getting the sentance from db.");
			if (item) {
				return item.id;
			} else {
				return addItemAndReturnID(brainSentances, "sentence", text);
			}
		});
	}
}

async function addItemAndReturnID(db, type, text) {
	return new Promise((resolve) => {
		var Item = new db({
			type: text,
		});
		db.save((err) => {
			if (err) throw err;
			db.findOne({ type: text }, function(err, item) {
				if (err) console.log("There was an error.");
				if (item) {
					resolve(item.id);
				}
			});
		});
	}).then((response) => {
		return response;
	});
}

async function get_words(text) {
	let holder = text.split(" ");
	let counter = {};
	holder.forEach((item) => {
		if (item in counter) {
			counter[item] = counter[item] + 1;
		} else {
			counter[item] = 1;
		}
	});

	return counter;
}

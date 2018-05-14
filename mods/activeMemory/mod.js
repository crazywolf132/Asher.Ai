module.exports = async (subject, message, userID, respond) => {
	const core = require(process.cwd() + "/server");
	const memory = core.addActiveMemory;
	const brain = core.activeMemory;
	console.log("Got this far...")
	respond(userID, await MemoryHeader(message, userID, nlp, brain, memory, core));
};

MemoryHeader = (message, userID, nlp, brain, memory, core) => {
	return new Promise((resolve) => {
		console.log("To here...")
		const whoList = [
			"girlfriend",
			"mom",
			"dad",
			"boyfriend",
			"husband",
			"wife",
		];
		const whatList = ["name", "address", "phone number", "name"];
		const howList = ["old"];

		let _got = nlp(message).out("normal");
		let _tokes = nlp(_got)
			.terms()
			.data();
		const mem = ["who", "what", "how"];
		if (mem.indexOf(_tokes[0].text) > -1) {
			console.log("One of these...")
			// This means we are looking back upon memory...
			console.log(
				"We are looking for a question begging with: " + _tokes[0].text
			);
			switch (_tokes[0].text) {
				case "who":
					whoList.forEach(function(item) {
						if (message.indexOf(item) > -1) {
							if (item in brain[userID]) {
								// We have found that the item was remembered...
								// going to return it now...
								resolve("Your " + item + " is " + brain[userID][item]);
							} else {
								resolve(
									"Sorry, you havent told me yet, or i have simply forgotten."
								);
							}
						}
					});
					//return "I'm sorry, I dont actually know how to help you with that one..."
					break;
				case "what":
					whatList.forEach(function(item) {
						if (message.indexOf(item) > -1) {
							if (item in brain[userID]) {
								// We have found that the item was remembered...
								// going to return it now...
								resolve("Your " + item + " is " + brain[userID][item]);
							} else {
								resolve(
									"Sorry, you havent told me yet, or i have simply forgotten."
								);
							}
						}
					});
					//return "I'm sorry, I dont actually know how to help you with that one..."
					break;
				case "how":
					howList.forEach(function(item) {
						if (message.indexOf(item) > -1) {
							if (item in brain[userID]) {
								// We have found that the item was remembered...
								// going to return it now...
								resolve(brain[userID][item]);
							} else {
								resolve(
									"Sorry, you havent told me yet, or i have simply forgotten."
								);
							}
						}
					});
					//return "I'm sorry, I dont actually know how to help you with that one..."
					break;
				default:
					resolve(
						"I'm sorry, I dont actually know how to help you with that one..."
					);
					break;
			}
		} else {

			console.log("Should be running.")
			whole_list = [];
			whoList.forEach(function(entry) {
				whole_list.push(entry);
			});
			whatList.forEach(function(entry) {
				whole_list.push(entry);
			});
			howList.forEach(function(entry) {
				whole_list.push(entry);
			});
			console.log(nlp(message).match('* #Person').found)
			whole_list.forEach(function(item) {
				if (message.indexOf(item) > -1) {
					// We are going to assume the last item is the value...
					//core.activeMemory[socket.id].associations.push(_tokes[_tokes.length - 1].text);
					//TODO: Fix the above code. it is useless... hahaha
					memory(userID, item, _tokes[_tokes.length - 1].text);
					resolve("I have remembered that now...");
				}
			});
		}
	});
};

module.exports = async (subject, message, socket, socketUsed) => {
	const core = require(process.cwd() + "/server");
	const memory = core.addActiveMemory;
	const brain = core.activeMemory;

	// We need to check to see if there is a memory of this module...
	// If so, we shouldnt run head... we should run a different function...
	if (core.memory(socket.id)) {
	} else {
		return await head(core, message, socket, nlp, brain, memory);
	}
};

head = (core, message, socket, nlp, brain, memory) => {
	return new Promise((resolve) => {
		const make = ["create", "make"];
		const named = ["named", "called", "titled"];
		const add = ["add", "put"];
		const remove = ["remove", "take"];

		// We are naturally going to assume that the item after each
		// of these is going to be the one we want... If that makes sense...
		// eg. make a new list called john
		//                            ^^^^
		// That is the item we want, and it is after an item in the
		// "named" list...
		make.forEach((item) => {
			if (message.indexOf(item) > -1) {
				// We are making a brand new list...
				named.forEach((i) => {
					if (message.indexOf(i) > -1) {
						// We are going to assume that the next word is
						// going to be the name...
					}
				});
				// We are going to assume, that because we got to this state...
				// The title was not found in the message

				// We now need to remember this module, so we can ask a question...
				core.remember(socket.id, "shoppingList");
				resolve("What would you like this list to be called?");
			}
		});
		add.forEach((item) => {
			if (message.indexOf(item) > -1) {
				// We are adding an item to a list...
				// We need to check to see if the list is even there...
			}
		});
		remove.forEach((item) => {
			if (message.indexOf(item) > -1) {
				// We are taking an item off the list...
				// We need to check to see if the list even exists...
			}
		});
	});
};

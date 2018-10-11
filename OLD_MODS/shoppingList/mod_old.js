module.exports = async (subject, message, userID, respond) => {
	const core = require(process.cwd() + "/server");
	const memory = core.addActiveMemory;
	const brain = core.activeMemory;

	// We need to check to see if there is a memory of this module...
	// If so, we shouldnt run head... we should run a different function...
	if (core.memory(userID)) {
		respond(userID, await sendOff("", "frank", respond, userID, nlp, core, brain, memory));
	} else {
		//return await head(core, message, socket, nlp, brain, memory);
		respond(userID, await sendOff("", "frank", respond, userID, nlp, core, brain, memory));
	}

};

sendOff = (shoppingList, person, respond, userID, nlp, core, brain, memory) => {
	// This is where we will get the persons name and check if there was any
	// associations between the person with the list and the reciever...
	console.log("running send off.")
	var result = core.checkAssociations(userID, person);
	console.log("Result is: " + result)
	if (!result) {
		// we just need to get their email address so we can send it to them...
		// or we can send it via sockets...
		// for now, as i dont have time to implement an email sender... we will send the person
		// the message via sockets.
		return "I am so sorry, but I cant send the list to that person."
	} else {
		//TODO: need to learn to send the message to a sepecific socket id.
		respond(userID, `incoming message from ${activeMemory[id].name}`);
		//socket[result].emit('result', 'incomming message from ' + activeMemory[id].name);
		return "Sending it now."
		
		
	}
}

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
		/*make.forEach((item) => {
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
		});*/
	});
};

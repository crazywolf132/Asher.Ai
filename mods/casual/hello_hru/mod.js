module.exports = async (subject, message, socket, core, continuation) => {
	const responses = ["hello", "hey", "G'day", "hi", "howdy", "aloha"];
	const how_r_u = "how .? you .?"
	const hru_response = ["I am good thankyou.", "I am doing awesome.", "Nothing could be better."]
	const good_replys = [
		"i am (good|great|excelent|ok) .?",
		"I'm (good|great|excelent|ok) .?",
	];
	const bad_replys = [
		"i am not .? (good|great|excelent|ok) .?",
		"I'm not .? (good|great|excelent|ok) .?",
	];
	const question = ", how are you?";
	const second_responses_good = [
		"Thats good to hear",
		"Thats what i like to hear",
		"Thats Great!",
	];
	const second_responses_bad = [
		"Thats not good!",
		"Oh no, thats not what i was wanting to hear.",
	];
	if (continuation) {
		core.logger("DEBUG", "we are continueing with this module...");
		arrayHolder =
			good_replys +
			"$$" +
			bad_replys +
			"$$" +
			second_responses_good +
			"$$" +
			second_responses_bad;
		_result = await continueMod(nlp, arrayHolder, message, core, socket);
	} else {
		core.logger("DEBUG", "Reading throught the message to see what to do.");
		if (nlp(message).match(how_r_u).found) {
			// Well, this means that no matter what... we must respond to the hru...
			// As in their convo, it was asking how we are.
			let secondLine = ['How about yourself?', 'and you?'];
			// We are going to have to assume their next input message is going to be
			// a reply to this. As we must ask how they are going... as that is courtesy.
			core.remember(socket.id, "casual/hello_hru");
			// We are just going to do a check to see if there was a hello or something
			// at the start of the sentace... so then we can respond to it at the same time.
			let wasFound = false;
			responses.forEach((item) => {
				if (message.indexOf(item) > -1) {
					wasFound = true;
				}
			})
			if (!wasFound) {
				core.logger("DEBUG", "There was no opener to be found.");
				return hru_response[Math.floor(Math.random()*hru_response.length)]
				+ " "
				+ secondLine[Math.floor(Math.random()*secondLine.length)]
			}

			core.logger("DEBUG", "We found an opener in this...");
			return responses[Math.floor(Math.random()*responses.length)]
			+ ". "
			+ hru_response[Math.floor(Math.random()*hru_response.length)]
			+ " "
			+ secondLine[Math.floor(Math.random()*secondLine.length)]



		} else {
			core.logger("DEBUG", "There was no 'how are you' in this...");
			// we are now just going to assume they just said hello... otherwise, the
			// memory isnt working, as they must have responded with an answer... :(
			return responses[Math.floor(Math.random()*responses.length)]
		}


		/*
		if (Math.random() >= 0.5) {
			core.remember(socket.id, "casual/hello_hru");
			return responses[Math.floor(Math.random() * responses.length)] + question;
		} else {
			core.forget(socket.id);
			return responses[Math.floor(Math.random() * responses.length)];
		}*/
	}
};

async function continueMod(nlp, arrayHolder, message, core, socket) {
	let holder = arrayHolder.split("$$");
	let good_list = holder[0];
	let bad_list = holder[1];
	let good_res = holder[2];
	let bad_res = holder[3];
	core.logger("running the continuation module worker");
	return new Promise((resolve) => {
		core.logger("promise has been started");
		let _response = ""
		core.addResponder(message, good_list, function(){
			_response = (good_res[Math.floor(Math.randon() * good_res.length)]);
		})
		core.addResponder(message, bad_list, function(){
			_response = (bad_res[Math.floor(Math.random() * bad_res.length)]);
		})
		resolve("Sorry, i dont know how to respond to that...");
	});
}

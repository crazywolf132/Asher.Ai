module.exports = async (subject, message, socket, socketUsed) => {
	const input = message.split(" ");
	const query = input[input.length - 1];


	return await ask(message, subject, query);
};
//TODO: Check to see if the question has already been asked, and is
// in the cache memory, to save the amount of requests we are making...
//TODO: re-enable this module... but load the activeMemory module before this one...
//TODO: re-add "what is .?" to the words.txt file of this module...
ask = (message, subject, query) => {
	const request = require("request");
	const core = require(process.cwd() + "/server");
	const brain = core.cacheMemory;
	const memory = core.addCacheMemory;
	return new Promise((resolve) => {
		let _got = nlp(message).out("normal");
		let _tokes = nlp(_got)
			.terms()
			.data();
		const normal = ["what", "who", "when", "where", "why", "how"];
		if (normal.indexOf(_tokes[0].text) > -1){
			if (_tokes[0].text in brain) {
				// the question type is in the brain already... so lets see if the subject is...
				console.log(_tokes[0].text)
				if (subject in brain[_tokes[0].text]) {
					// The knowledge is already here... lets just send that again...
					resolve(brain[_tokes[0].text][subject])
				} else {
					request.get(
						"http://api.duckduckgo.com/?q=Where+is+" +
							query +
							"&format=json&pretty=1",
						(err, resp, body) => {
							if (!err && resp.statusCode == 200) {
								let bodie = JSON.parse(body);
								if (bodie.Abstract) {
									var response = bodie.Abstract;
									brain[_tokes[0].text][subject] = (response.substring(0, response.indexOf(".") + 1));
									resolve(response.substring(0, response.indexOf(".") + 1));
								} else {
									resolve("I'm sorry I couldn't find any information about " + query);
								}
							}
						}
					);
				}
			}
		}
	});
};

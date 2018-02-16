module.exports = async (subject, message, socket, socketUsed) => {
	const input = message.split(" ");
	const query = input[input.length - 1];
	return await ask(query);
};
//TODO: Check to see if the question has already been asked, and is
// in the cache memory, to save the amount of requests we are making...
//TODO: re-enable this module... but load the activeMemory module before this one...
//TODO: re-add "what is .?" to the words.txt file of this module...
ask = (query) => {
	const request = require("request");
	return new Promise((resolve) => {
		request.get(
			"http://api.duckduckgo.com/?q=Where+is+" +
				query +
				"&format=json&pretty=1",
			(err, resp, body) => {
				if (!err && resp.statusCode == 200) {
					let bodie = JSON.parse(body);
					if (bodie.Abstract) {
						var response = bodie.Abstract;
						resolve(response.substring(0, response.indexOf(".") + 1));
					} else {
						resolve("I'm sorry I couldn't find any information about " + query);
					}
				}
			}
		);
	});
};

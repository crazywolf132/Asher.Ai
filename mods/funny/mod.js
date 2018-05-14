module.exports = async (subject, message, userID, respond) => {
	jokes = [
		"I wrote a song about a tortilla. Well actually, it’s more of a wrap.",
		"“Um.” — First horse that got ridden",
		"Some people just have a way with words, and other people … oh … not have way.",
	];
	respond(userID, jokes[Math.floor(Math.random() * jokes.length)]);
};

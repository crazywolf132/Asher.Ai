module.exports = async (subject, message, userID, respond) => {
	//The subject contains the number of sides the user has said...
	if (subject == message) {
		// This means there was no set number... so we will set it to 6;
		subject = 6;
	}
	respond(userID, Math.floor(Math.random() * subject + 1));
};


module.exports.core = (core) => {
	let words = [`roll a .?`, `roll a #Value .?`, `.? a (dice|die)`, `roll a dice`, `throw a dice`];
	core.Asher.hear(words, (payload, chat) => {
		chat.say(Math.floor(Math.random() * 6 + 1));
	});
}
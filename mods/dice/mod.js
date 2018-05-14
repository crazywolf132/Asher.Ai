module.exports = async (subject, message, userID, respond) => {
	//The subject contains the number of sides the user has said...
	if (subject == message) {
		// This means there was no set number... so we will set it to 6;
		subject = 6;
	}
	respond(userID, Math.floor(Math.random() * subject + 1));
};

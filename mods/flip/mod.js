module.exports = async (subject, message, userID, respond) => {
	choices = ["heads", "tales"];
	respond(userID, choices[Math.floor(Math.random() * choices.length)]);
};

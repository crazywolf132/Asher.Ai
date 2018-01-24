module.exports = async () => {
	const responses = [
		"Nothing much",
		"Just the same old",
		"Talking to you",
		"Looking over my code"
	];
	return responses[Math.floor(Math.random() * responses.length)];
};

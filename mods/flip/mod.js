module.exports.core = (core) => {
	let choices = ['heads', 'tales'];
	let words = ['.? a coin .?', 'flip a .?', 'toss a .?', 'flip .?', 'toss .?', 'flip a coin'];
	core.Asher.hear(words, (payload, chat) => {
		chat.say(choices[Math.floor(Math.random() * choices.length)]);
	});
}

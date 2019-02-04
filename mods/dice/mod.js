export function core(core) {
	let words = [`roll a .?`, `roll (a|an) #Value *?`, `.? a (dice|die)`, `roll a dice`, `throw a dice`];
	core.Asher.hear(words, (payload, chat) => {
		chat.say(Math.floor(Math.random() * 6 + 1));
	});
}
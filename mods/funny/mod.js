export function core(core) {
    let words = ["tell .? joke", ".? tell .? joke", ".? humour .?", "how about a joke .?", "make .? laugh .?", "joke around .?"];
    core.Asher.hear(words, (payload, chat) => {
      jokes = ["I wrote a song about a tortilla. Well actually, it’s more of a wrap.", "“Um.” — First horse that got ridden", "Some people just have a way with words, and other people … oh … not have way."];
      chat.say(jokes[Math.floor(Math.random() * jokes.length)]);
    });
}
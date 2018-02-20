module.exports = async () => {
  const responses = [
    "Sorry, i dont speak bird person.",
    "Oh my god, I love rick and morty!",
    "Are you in pain? How can I help?"
 ]

 return responses[Math.floor(Math.random() * responses.length - 1)];
}

module.exports.core = (core) => {
  core.Asher.hear([`count to #Value`, `*? count to #Value *?`], (payload, chat) => {
    let value = core.nlp(payload).match("#Value").out("text");
    chat.say(await counter(value));
  })
}

async function counter(to) {
  return new Promise((resolve) => {
    let message = ""
    for (i = 0; i < to; i++) {
      message === "" ? message += (i + 1) : message += ", " + (i + 1)
    }
    resolve(message)
  }).then((response) => {
    return response
  })
}

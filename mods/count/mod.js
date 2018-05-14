module.exports = async (subject, message, userID, respond) => {
  let value = nlp(message)
    .match("#Value")
    .out("text");

  respond(userID, await counter(value));
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

module.exports = async (subject, message, socket, socketUsed) => {
  let value = nlp(message)
    .match("#Value")
    .out("text");

  return await counter(value, socket);
  //tosend += value;
  //return tosend
}

async function counter(to, socket) {
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

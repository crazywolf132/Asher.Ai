module.exports = async (subject, message, socket, socketUsed) => {
  const core = require(process.cwd() + "/server");
  const memory = core.addActiveMemory;
  const brain = core.activeMemory;

  return await head(message, socket, nlp, brain, memory);
};

head = (message, socket, nlp, brain, memory) => {
  return new Promise((resolve) => {
    const make = ['create', 'make'];
    const add = ['add', 'put'];
    const remove = ['remove', 'take'];

    make.forEach((item) => {
      if (message.indexOf(item) > -1) {
        // We are making a brand new list...
      }
    });
    add.forEach((item) => {
      if (message.indexOf(item) > -1) {
        // We are adding an item to a list...
          // We need to check to see if the list is even there...
      }
    });
    remove.forEach((item) => {
      if (message.indexOf(item) > -1) {
        // We are taking an item off the list...
      }
    })
  })
}

module.exports = async (subject, message, socket, socketUsed) => {

  const core = require(process.cwd() + "/server");
  const memory = core.addActiveMemory;
  const brain = core.activeMemory;


  return await head(message, socket, nlp, brain, memory);
}

head = (message, socket, nlp, brain, memory) => {
  return new Promise((resolve) => {
    const whoList = ['girlfriend', 'mom', 'dad', 'boyfriend', 'husband', 'wife'];
    const whatList = ['name', 'address', 'phone number', 'name'];
    const howList = ['old'];

    let _got = nlp(message).out("normal");
    let _tokes = nlp(_got)
      .terms()
      .data();
    const mem = ["who", "what", "how"];
    if (mem.indexOf(_tokes[0].text) > -1) {
      // This means we are looking back upon memory...
      console.log("We are looking for a question begging with: " + _tokes[0].text)
      switch(_tokes[0].text) {
        case "who":
          whoList.forEach(function(item) {
            if (message.indexOf(item) > -1){
              if (item in brain[socket.id]){
                // We have found that the item was remembered...
                // going to return it now...
                resolve("Your " + item + " is " + brain[socket.id][item])
              } else {
                resolve("Sorry, you havent told me yet, or i have simply forgotten.")
              }
            }
          })
          //return "I'm sorry, I dont actually know how to help you with that one..."
          break;
        case "what":
          whatList.forEach(function(item) {
            if (message.indexOf(item) > -1){
              if (item in brain[socket.id]){
                // We have found that the item was remembered...
                // going to return it now...
                resolve("Your " + item + " is " + brain[socket.id][item])
              } else {
                resolve("Sorry, you havent told me yet, or i have simply forgotten.")
              }
            }
          })
          //return "I'm sorry, I dont actually know how to help you with that one..."
          break;
        case "how":
          howList.forEach(function(item) {
            if (message.indexOf(item) > -1){
              if (item in brain[socket.id]){
                // We have found that the item was remembered...
                // going to return it now...
                resolve(brain[socket.id][item])
              } else {
                resolve("Sorry, you havent told me yet, or i have simply forgotten.")
              }
            }
          })
          //return "I'm sorry, I dont actually know how to help you with that one..."
          break;
        default:
          resolve("I'm sorry, I dont actually know how to help you with that one...")
          break;
      }
    } else {
      whole_list = [];
      whoList.forEach(function(entry) {
        whole_list.push(entry);
      })
      whatList.forEach(function(entry) {
        whole_list.push(entry);
      })
      howList.forEach(function(entry) {
        whole_list.push(entry);
      })
      whole_list.forEach(function(item) {
        if (message.indexOf(item) > -1) {
          // We are going to assume the last item is the value...
          memory(socket.id, item, _tokes[_tokes.length - 1].text);
          resolve("I have remembered that now...");
        }
      })
    }
  })
}

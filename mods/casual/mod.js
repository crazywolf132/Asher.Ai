module.exports = (function (subject, message, socket) {
  // We now need to create sub modules... so then we can
  // create a natural language response... So then we dont
  // need to have a specific module for each single common
  // response.
  const allSubMods = {};
  //Find every module folder... go into it... check for the mod.js file,
  //load the words.txt file... check if any of those match the `message` input...
  const subMods = [];
  findFilesAndFolders(`./mods/casual/`, subMods, true, true, false);
  //return await getMods(allSubMods, subMods, toRun, subject, message, socket)
  return await working(message, subMods);
  //return await perform(toRun, allSubMods, subject, message, socket)
});
async function working(message, subMods) {
  return new Promise((resolve) => {
    subMods.forEach((item) => {
      const holder = [];
      findFilesAndFolders(`./mods/casual/${item}/`, holder, false, false, true);
      holder.forEach((file) => {
        if (file == `./mods/casual/${item}/words.txt`) {
          //We are just going to assume there is a responses.txt file...
          const wordsHolder = [];
          fileToArray(`./mods/casual/${item}/words.txt`, wordsHolder);
          wordsHolder.forEach((sentance) => {
            if (nlp(message).match(sentance).found) {
              console.log("Going to run the sub-module: " + item);
              const res = [];
              fileToArray(`./mods/casual/${item}/responses.txt`, res);
              const randomResponse = res[Math.floor(Math.random() * res.length)];
              console.log("Going to respond to this question with: " + randomResponse);
              resolve(randomResponse);
            }
          });
        }
      });
    });
  });
};
/*function getResponse(subject, message, socket) {
  let allSubMods = {}
  let subMods = []
  findFiles
}

function getMods(allSubMods, subMods, toRun, subject, message, socket) {
  subMods.forEach(function(item) {
      let holder = [];
      findFilesAndFolders(`./mods/casual/` + item + `/`, holder, false, false, true)
      holder.forEach(function(file) {
          if (file == `./mods/casual/` + item + `/responses.txt`) {
              //allSubMods[item] = require(`./` + item + `/mod.js`);

          } else if (file == `./mods/casual/` + item + `/words.txt`) {
              let wordsHolder = []
              fileToArray(`./mods/casual/` + item + `/words.txt`, wordsHolder)
              wordsHolder.forEach(function(sentance){
                  if (nlp(message).match(sentance).found){
                    console.log("Going to run the sub-module: " + item)
                    var toRun = allSubMods[item]
                    //socket.emit('result', toRun(subject, message, socket))
                    Promise.resolve(toRun(subject, message, socket)).then((response) => {
                      console.log("waiting now...")
                      return response;
                    })
                    //return (toRun(subject, message, socket))
                  }
              })
          }
      })
  })
}

function perform(item, allSubMods, subject, message, socket) {
  return new Promise(resolve => {
    var toRun = allSubMods[item]
    let result = toRun(subject, message, socket)
    resolve(result)
  })
}*/

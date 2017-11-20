module.exports=(
  function(subject, message){
    // We now need to create sub modules... so then we can
    // create a natural language response... So then we dont
    // need to have a specific module for each single common
    // response.
    let allSubMods = []
    loadAllMods(allSubMods, null, false);
    //Find every module folder... go into it... check for the mod.js file,
    //load the words.txt file... check if any of those match the `message` input...
    let subMods = []
    findFilesAndFolders(`./mods/casual/`, subMods, true, true, false)
    subMods.forEach(function(item) {
        let holder = [];
        findFilesAndFolders(`./mods/casual/` + item + `/`, holder, false, false, true)
        holder.forEach(function(file) {
            if (file == `./mods/casual/` + item + `/words.txt`) {
                let wordsHolder = []
                fileToArray(`./mods/casual/` + item + `/words.txt`, wordsHolder)
                wordsHolder.forEach(function(sentance){
                    if (nlp(message).match(sentance).found){
                      var runMe = allSubMods[item]
                      return (runMe(subject, message))
                    }
                })
            }
        })
    })
  }
);

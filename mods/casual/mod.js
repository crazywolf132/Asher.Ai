module.exports=(
  function(input){
    // We now need to create sub modules... so then we can
    // create a natural language response... So then we dont
    // need to have a specific module for each single common
    // response.

    let holdMyBeer = []
    findFilesAndFolders('./mods/casual/', holdMyBeer, true, true, false);
    console.log('\n\n' + holdMyBeer + '\n\n')

    let hello = []
    let goodDay = []
    let hru = []

    fileToArray('./mods/casual/hello/words.txt', hello);
    fileToArray('./mods/casual/hru/words.txt', hru);
    fileToArray('./mods/casual/goodDay/words.txt', goodDay);

    //console.log(hello)
    //console.log(goodDay)
    //console.log(hru)

    // We are now going to work out what module to run...
    holdMyBeer.forEach(function(mod){
      switch(mod){
        case "hello":
          speak.closest(input, [hello]);
          break;
        case "goodDay":
          speak.closest(input, [goodDay]);
          break;
        case "hru":
          speak.closest(input, [hru]);
        default:
          ""
      }
    })

  }

);

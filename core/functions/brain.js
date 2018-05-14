/*
    THIS 'BRAIN' IS THE CONVERSATION MODEL
    FOR THE WHOLE OF ASHER. IF THE USER IS
    HAVING A GENERAL CONVERSATION WITH HIM
    IT WILL ALL COME THROUGH HERE....
*/


/* 
    IN THIS VERSION OF THE ASHERS BRAIN...
    THE ASSOCIATIONS DATABASE WILL WORK ONLY
    WITH NUMBERS INSTEAD OF STRINGS WITH NUMBERS
    ASSOCIATED TO THEM, AS THIS REQUIRES TOO MUCH
    MEMORY TO PROCESS AND TOO MUCH TIME TO SORT
    FOR IT.
*/

const findFilesAndFolders = require("./helper").findFilesAndFolders;
const arrayToFile = require("./helper").arrayToFile;
const fileExists = require("./helper").fileExists;
const speak = require("speakeasy-nlp");
const fs = require("fs");

var exports = (module.exports = {});

exports.__wordsDB = __wordsDB = [];
exports.__responsesDB = __responsesDB = [];
exports.__unknown_phrases = __unknown_phrases = [];
exports.__associationsDB = __associationsDB = {};
exports.__reverse_associationsDB = __reverse_associationsDB = {};

exports.loadBrain = () => {

    var allFileNames = [];
    findFilesAndFolders(process.cwd() + "/training_data/", allFileNames, false, false, true);
    var currentFile = "";

    __exists = fileExists(process.cwd() + "/ashersBrain.save");
    /*
        To save some computational energy, we will load the saved brain
        if it exists, if not, we will load from teh normal db.
    */
    if (__exists) {
        allFileNames = []
        allFileNames.push(process.cwd() + "/ashersBrain.save");
    }
    allFileNames.forEach((file) => {
        console.log("Loading : " + file);
        var fileContents = [];
        var lastHeader = "";
        currentFile = file.replace(".yml", "");
        var lastHeader = "";

        var array = fs
            .readFileSync(file)
            .toString()
            .split("\n");
        for (let i = 0; i < array.length; i++) {
            if (array[i] !== "") {
                let holder = array[i].replace("  ", "");
                fileContents.push(holder);
            }
        }

        for (i = 0; i < 4; i++){
            fileContents.splice(0, 1);
        }

        fileContents.forEach((item) => {
            if (item.includes("- - ")) {
                var holder = item.replace("- - ", "");
                holder = holder.replace("?", "");
                // This means its a header...
                lastHeader = holder;
                if (!(holder in __wordsDB)) {
                    __wordsDB.push(holder)
                }
            } else if (item.includes("- ")) {
                // This means its the response to the last header.
                var holder = item.replace("- ", "");
                if (!(holder in __responsesDB)){
                    __responsesDB.push(holder);
                }
                //Going to associate last header with this...
                if (lastHeader in __associationsDB) {
                    // This means its already in here... lets check to see if this response is to...
                    if (!__associationsDB[lastHeader].indexOf(holder) > -1) {
                        // This means the response isnt in there...
                        // Lets get the id and add it.
                        __associationsDB[lastHeader].push(__responsesDB.indexOf(holder));
                    }
                } else {
                    // This means it isnt in the associations yet...
                    // We need to add it, then add this response to it.
                    __associationsDB[lastHeader] = [];
                    __associationsDB[lastHeader].push(__responsesDB.indexOf(holder));
                }
            }
        })

    })
}


exports.generateBackLinkBrain = () => {
    Object.keys(__associationsDB).forEach((header) => {
        __associationsDB[header].forEach((item) => {
            if (item in __reverse_associationsDB) {
                // This means this answer is already in there...
                // We just need to check to see if this header is associated to it.
                if (!(header in __reverse_associationsDB[item])) {
                    // It isnt there, so lets add it.
                    __reverse_associationsDB[item].push(__wordsDB.indexOf(header));
                    //__reverse_associationsDB[item].push(header);
                }
            } else {
                // This means the answer isnt already in the database... lets add it.
                __reverse_associationsDB[item] = [];
                __reverse_associationsDB[item].push(__wordsDB.indexOf(header));
                //__reverse_associationsDB[item].push(header);
            }
        })
    })
}


/*
    The purpose of this function is to make sure both the backLink and
    core are both intact and uptodate with eachother. If one is out, it
    will need to be brought up to date.
*/
exports.stabaliseBrain = () => {
    // We are going to compare the core to the backLink.
    // As the core gets updated by default whereas the backlink doesnt.
    Object.keys(__associationsDB).forEach((header) => {

    })
}


exports.saveBrain = () => {
    var __ashersBrain = [];
    Object.keys(__associationsDB).forEach( (item) => {
        __ashersBrain.push("- - " + item);
        __associationsDB[item].forEach( (subItem) => {
            var __position = subItem;
            __ashersBrain.push("  - " + __responsesDB[__position])
        })
    } )
    arrayToFile(process.cwd() + "/ashersBrain.save", __ashersBrain);
}

exports.duplicateCheck = () => {
    var __seen = [];
    var __dupes = [];

    Object.keys(__associationsDB).forEach((item) => {
        if (item in __seen) {
            if (!(item in __dupes)) {
                __dupes.push(item);
            }
        } else {
            __seen.push(item);
        }
    })
    return __dupes;
}


exports.getInfo = () => {
    console.log("There are " + __wordsDB.length + " inputs");
    console.log("There are " + __responsesDB.length + " responses");
    console.log("There are " + Object.keys(__associationsDB).length + " associations")
    var res = exports.duplicateCheck();
    console.log(res);
    //console.log("Is 'How are you doing' in array? " + "How are you doing" in __associationsDB)

    __wordsDB.forEach( (item) => {
        if (!(item in __associationsDB)) {
            console.log(" -- '" + item + "' is not in the associations DB");
        }
    })
}


/*
    The purpose of this function is to receive the response to the input from
    the user. 
*/
exports.getResponse = (_input) => {
    try {
        var outputNum = __associationsDB[_input][Math.floor(Math.random() * __associationsDB[_input].length)];
        // We now have the number of the index... now, lets just display it.
        return __responsesDB[outputNum];
    } catch (error) {
        // Lets perform a check to see if it is in the db... if not...
        // We will mark it for latter use and see the response ... then
        // associate it.
        if (_input in __associationsDB || _input in __wordsDB) {
            // hmmm... its in one of these... whats up?
            return "-1";
        } else {
            // Lets add it to the unknown phrases list.
            if (!(_input in __unknown_phrases)) {
                __unknown_phrases.push(_input);
            }
            return "-1";
        }       
    }
}


/*
    The purpose of this function to the create Synapse Links
    in Ashers brain. Much like how the human brain works, we are
    associating different things with eachother.

    A good example of this is the "How are you" and "How are you doing"
    question. Asher was only trained on "How are you doing", so if
    someone asks him "How are you", by default he has no clue that
    they are the same... Thats what this is for. To let him know,
    that they both share the same responses and that they are the
    same question.
*/
exports.synapseLinks = (__input) => {
    // We are going to use Levenshtein distance to see if the
    // inputec question is in anyway similar to something we
    // already know, so then we might be able to use that response.
    console.log("\n\n\n")
    console.log("Closest is: ")
    console.log(speak.closest(__input, __wordsDB));
    console.log("position is: ")
    console.log(__wordsDB.indexOf(speak.closest(__input, __wordsDB)))
    console.log(__wordsDB[148])
    console.log("\n\n\n")
}


exports.updateAssociations = (__question, __answer) => {
    var __pos_ans, __pos_word;
    if (!(__answer in __responsesDB)) {
        __responsesDB.push(__answer);
    }
    __pos_ans = __responsesDB.indexOf(__answer);

    if (!(__question in __wordsDB)) {
        __wordsDB.push(__question);
    }
    __pos_word = __wordsDB.indexOf(__question);

    if (__question in __associationsDB) {
        if (!(__pos_ans in __associationsDB[__question])) {
            __associationsDB[__question].push(__pos_ans);
        }
    } else {
        __associationsDB[__question] = [];
        __associationsDB[__question].push(__pos_ans);
    }
    if (__question in __unknown_phrases) {
        delete __unknown_phrases[__question];
    }
}

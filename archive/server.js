const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const stylus = require("stylus");
const fs = require("fs");
const request = require("request");
const io = require("socket.io")(4416);
const speak = require("speakeasy-nlp");
const nlp = require("compromise");
const sentiment = require("sentiment");
const modHandler = require("../core/functions/mod_handler");
const helper = require("../core/functions/helper");
const brain = require("../core/functions/brain");
const messenger = require("../core/functions/messenger_handler");
const loadBrain = brain.loadBrain;
const generateBackLinkBrain = brain.generateBackLinkBrain;
const saveRawBrain = brain.saveRawBrain;
const trainAllMods = modHandler.trainAllMods;
const loadAllMods = modHandler.loadAllMods;
const newLoadMods = modHandler.newLoadMods;
const getMod = modHandler.getMod;
const latestGetMod = modHandler.getMod;
const mods = modHandler.mods;
const fileToArray = helper.fileToArray;
const findFilesAndFolders = helper.findFilesAndFolders;
const fileToDict = helper.fileToDict;
const messageProcess = messenger.messageProcess;
const messengerRespond = messenger.respond;

// These are going to be the normal variables... that get
// used by asher to store information.
var internet = false;
var modDB = {}
//modDB.other = {}



const homeRouter = require("../routes/home");
const webHook = require("../routes/webhook");

/*
 ██████  ██████  ██████  ███████
██      ██    ██ ██   ██ ██
██      ██    ██ ██████  █████
██      ██    ██ ██   ██ ██
 ██████  ██████  ██   ██ ███████
*/
console.log("[INFO]  Starting...");
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(stylus.middleware(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.use("/", homeRouter);
app.use("/webhook", webHook);

const port = process.env.PORT || 80;

const router = express.Router();

/*
███████ ██    ██ ███    ██  ██████ ████████ ██  ██████  ███    ██ ███████
██      ██    ██ ████   ██ ██         ██    ██ ██    ██ ████   ██ ██
█████   ██    ██ ██ ██  ██ ██         ██    ██ ██    ██ ██ ██  ██ ███████
██      ██    ██ ██  ██ ██ ██         ██    ██ ██    ██ ██  ██ ██      ██
██       ██████  ██   ████  ██████    ██    ██  ██████  ██   ████ ███████
*/

// I am doing this so the knowledge module doesnt have to make so many requests...
module.exports.cacheMemory = cacheMem = {};
cacheMem.who = {}
cacheMem.what = {}
cacheMem.when = {}
cacheMem.where = {}
cacheMem.why = {}
cacheMem.how = {}
// We can simply load the answe from here if we already have it...
module.exports.addCacheMemory = function (type, key, val) {
    console.log("cache being added too...")
    if (type in module.exports.cacheMemory) {
        if (key in module.exports.cacheMemory[type]) {
            // Well, it is already there... so we are just going to return a result...
            //backupBrain();
            return 0;
            // We are returning 0, as it didnt work...
        } else {
            // The question hasnt been asked yet... YAY! learning!
            module.exports.cacheMemory[type][key] = val;
            //backupBrain();
            return 1;
        }
    }

};

module.exports.activeMemory = memory = {};

module.exports.addActiveMemory = function (socketID, key, val) {
    module.exports.logger("INFO", socketID + " added something to active memory");
    if (socketID in module.exports.activeMemory) {
        module.exports.activeMemory[socketID][key] = val;
    } else {
        module.exports.activeMemory[socketID] = {};
        module.exports.activeMemory[socketID][key] = val;
    }
    //backupBrain();
};

module.exports.addResponder = (input, inArray, callback) => {
    inArray.forEach((item) => {
        if (nlp(input).match(item).found) {
            callback();
        }
    });
};

module.exports.remember = function (socketID, mod) {
    module.exports.activeMemory[socketID].savedStatus = true;
    module.exports.activeMemory[socketID].currentMods = mod;
};

module.exports.forget = function (socketID) {
    module.exports.activeMemory[socketID].savedStatus = false;
    module.exports.activeMemory[socketID].currentMods = "";
};

module.exports.memory = function (socketID) {
    if (module.exports.activeMemory[socketID].savedStatus) {
        return module.exports.activeMemory[socketID].currentMods;
    }
    return "false";
};

module.exports.checkInput = (input, regex, callback) => {
    if (nlp(input).math(regex).found) {
        callback();
    }
};

module.exports.capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports.responder = (userID, message) => {
    // Get the userID address....
    // ... right after we resolve the promise from the module.
    //console.log(message)
    //message.then((response) => {
    if (module.exports.activeMemory[userID].usingFB){
        // Need to send it to the fb responder function... 
        messengerRespond(userID, message, {typing: true});
        //messageProcess(userID, message);
    } else {
        socket = module.exports.activeMemory[userID].address;
        socket.emit("result", message);
    }
    //})
    
    //socket.sockets(userID)
}

module.exports.asher = (person, mod) => {
    this.person = person;
    this.currentMod = mod;

    this.say = (message) => {
        socket.broadcast.to(this.person).emit('result', message);
    }

    this.remember = () => {
        module.exports.remember(this.person, this.currentMod);
    }

    this.wait
}


module.exports.askQuestion = (person, question, mod, callback) => {
    module.exports.remember(person, mod);
    socket.broadcast.to(person).emit('result', messsage);
}

module.exports.respond = function(person, message) {
    socket.broadcast.to(person).emit('result', message)
}

module.exports.logger = (type, message) => {
    if (type === "NORMAL" || type === "Normal" || type === "") {
        type = "INFO";
    } else if (type === "DEBUG" || type === "Debug") {
        type = "DBUG";
    }
    console.log("[" + type + "]  " + message);
};

module.exports.fileExists = (filename) => {
    try {
        fs.accessSync(filename);
        return true;
    } catch (e) {
        return false;
    }
};


module.exports.checkAssociations = (id, otherPerson) => {
    console.log(module.exports.activeMemory[id].associations)
    if (id in module.exports.activeMemory) {
        // Well, this is a good start. The user is in the Brain.
        // We just need to check if the "otherPerson" is too.
        // We will run a for Loop to go over every ID in the brain
        // and see if there is someone with the name of "otherPerson".
        Object.keys(module.exports.activeMemory).forEach((key) => {
            if (module.exports.activeMemory[key].name === otherPerson) {
                // WOOOO We found the person we were talking about...
                // we just need to get this persons id. and check to see
                // if the "id" of the other person is associated witht he person
                // we just found. Then return the result.
                var otherPersonID = key;
                if (otherPersonID in module.exports.activeMemory[id].associations) {
                    // Wow, this person was write... they are associated to them.
                    // now  to return "true" so the module can continue its functions.
                    return true;
                } else {
                    // Oh no... We are so sorry, but this person cant be contacted as they arent
                    // associated...
                    // We will return "false" to let them know.
                    return false;
                }
            }
        })
        // We will return "false" now as there was no-one under that name.
        return false;
    }
}

module.exports.socketRegistration = socketRegistration = (id, socket, fb) => {
  module.exports.activeMemory[id] = {};
  module.exports.activeMemory[id].savedStatus = false;
  module.exports.logger("NORMAL", "remembering: " + id);
  module.exports.activeMemory[id].associations = [];
  module.exports.activeMemory[id].usingFB = true;
  module.exports.activeMemory[id].lastMessage = "";
  module.exports.activeMemory[id].address = socket;
  module.exports.activeMemory[id].brain = [];
  module.exports.activeMemory[id].brain.mem_mode = 0;
  module.exports.activeMemory[id].brain.last_message = "";
  //console.log(module.exports.activeMemory);
};

module.exports.runInput = runInput = (input, userID) => {
    input = module.exports.capitalizeFirstLetter(input);
    var toRun, sub;
    // We are just workingout the subject of the message...
    sub = speak.classify(input).subject;
    sub === undefined ? sub = input : sub = sub;
    // We are now going to set this users last message to the memory. So then if anything goes wrong
    // with the developers module, they can always check the last message in memory if so needed.
    module.exports.activeMemory[userID].lastMessage = input;
    //First of all, we are going to check if the user has an active memory... as we dont want to fuck around...
    var mem = module.exports.memory(userID)
    // Time to check if there is actually an active memory or not.
    if (mem !== "false") {
        // This means that asher has an active memory with a user.
        if (mem.indexOf("/") >= 0) {
            // If the mod name has a "/" in it, we are going to assume this is a "header-mod",
            // meaning that it will run a sub mod. So, we just want the first part... as we will
            // only support running of the "header-mod", the sub-mod is up to the developer to do.
            // If you need an example... Take a look at "casual"... That is a header mod...
            holder = mem.split("/");
            // We are just re-setting what our version of the memory looks like (local... not in the brain...)
            mem = holder[0];
        }
        // We are now going to "require" the mod...
        toRun = modDB[mem].import;
        // We are now starting the mod...
        toRun(sub, input, userID, module.exports.responder);
        // It should be runnning now, so that is it for us. All the memory disposal is up to the developer.
        // If you are developing a module with the memory system, take a look at the wiki for more info...
        // As we dont want developers to break the system by accident.
    } else {
        console.log("No memeroy")
        let _got = nlp(input).out("normal");
        let _tokes = nlp(_got)
            .terms()
            .data();
        let type = ""
        // This means that there is no active memory with asher, continue.
        // We now need to check what kind of module we are going to be running.
        const slang = ["whats", "whos", "whens", "wheres", "whys", "hows"];
        slang.indexOf(_tokes[0].text) > -1 ? type = _tokes[0].text.slice(0, -1) : type = "what";
        // Now that we have worked out what kind of module we are running...
        // we can now find which mod it is.

        toRun = modDB[latestGetMod(modDB, input)].import;
        toRun(sub, input, userID, module.exports.responder);
        
    }
}

/*
██████   ██████  ██    ██ ████████ ███████ ███████
██   ██ ██    ██ ██    ██    ██    ██      ██
██████  ██    ██ ██    ██    ██    █████   ███████
██   ██ ██    ██ ██    ██    ██    ██           ██
██   ██  ██████   ██████     ██    ███████ ███████
*/

io.on("connection", (client) => {
    module.exports.logger("NORMAL", "Client connected...");
    socketRegistration(client.id, client, false);
    client.on("message", (data) => {

        //TODO: Need to re-do this part... it is clunky and shit.
        /*Promise.resolve(workItOut(data, true, client)).then((response) => {
            module.exports.logger("NORMAL", "responded with " + response);
            if (response !== "undefined") {
                client.emit("result", String(response));
            }
        });*/
        //Promise.resolve(runInput(data, client.id)).then((respond) => {
            //if (response !== "undefinded") {
            //    client.emit("result", String(response));
          //  }
        //})
        console.log("New request")
        runInput(data, client.id);
        
        // I dont think we need to return anything as we are running it all through sockets...
        // We should be able to have a function that allows the module to respond.
    });
    client.on("disconnect", function () {
        module.exports.logger("NORMAL", "disconnected...");
    });
});

/*
███████ ███████ ████████ ██    ██ ██████
██      ██         ██    ██    ██ ██   ██
███████ █████      ██    ██    ██ ██████
     ██ ██         ██    ██    ██ ██
███████ ███████    ██     ██████  ██
*/
console.log(module.exports.cacheMemory);
//loadBrain();
console.time("loading Brain");
loadBrain();
console.timeEnd("loading Brain");
generateBackLinkBrain();
console.log("Saving brain");
//saveRawBrain();
//console.log(brain.__associationsDB);
//console.log("Backlinks brain: ")
//console.log(brain.__reverse_associationsDB);
//TODO: Fix this backlink...
var brainResponse = brain.getResponse("When will you die");
console.log(brainResponse)
brain.synapseLinks("How are you");
brain.getInfo();
//brain.saveBrain();

module.exports.logger("NORMAL", "Configuring mods...");
//loadMods(allMods, modDB, true);
newLoadMods(modDB);
//console.log(modDB);
//console.log(modDB['math'].isTheOne('flip a coin'))
/*Object.keys(modDB).forEach((mod) => {
    if (modDB[mod].isTheOne('Flip a coin')) {
        console.log(`The mod is ${mod}`)
    }
})
//fileToArray("swears.txt", swears);
// We are just going to a quick and dirty internet check...
require('dns').lookup('google.com', (err) => {
    err ? internet = false : internet = true;
})


/*
██      ██ ███████ ████████ ███████ ███    ██ ███████ ██████
██      ██ ██         ██    ██      ████   ██ ██      ██   ██
██      ██ ███████    ██    █████   ██ ██  ██ █████   ██████
██      ██      ██    ██    ██      ██  ██ ██ ██      ██   ██
███████ ██ ███████    ██    ███████ ██   ████ ███████ ██   ██
*/

setTimeout(() => {
    app.listen(port);
    module.exports.logger("NORMAL", `Magic happens on port ${port}\n\n`);
}, 1000);
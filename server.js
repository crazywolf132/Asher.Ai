console.log(`Starting....`);
const express = require(`express`);
const app = express();
const morgan = require(`morgan`);
const bodyParser = require(`body-parser`);
const mongoose = require(`mongoose`);

const config = require(`./config/database`);
const User = require(`./models/user`);
const fs = require(`fs`);
const request = require(`request`);
const io = require(`socket.io`)(4416);
const speak = require(`speakeasy-nlp`);
const nlp = require(`compromise`);
const sentiment = require(`sentiment`);
const mod_handler = require(`./core/functions/mod_handler`);
const helper = require(`./core/functions/helper`);
const trainAllMods = mod_handler.trainAllMods;
const loadAllMods = mod_handler.loadAllMods;
const getMod = mod_handler.getMod;
const fileToArray = helper.fileToArray;
const findFilesAndFolders = helper.findFilesAndFolders;
const removeFromArray = helper.removeFromArray;
const swears = [];
const _mod_types = {};
const mods = mod_handler.mods;
const clients = [];
const socketMods = [`timers`];
// These next two arrays are for the users... For when saving state
// and allowing the continuation of a mod.
const savedStates = {};
const currentMods = {}
const api_router = require(`./routes/api`);


/*
 ██████  ██████  ██████  ███████
██      ██    ██ ██   ██ ██
██      ██    ██ ██████  █████
██      ██    ██ ██   ██ ██
 ██████  ██████  ██   ██ ███████
*/

mongoose.connect(config.database);

app.use(morgan(`dev`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use((req, res, next) => {
    res.header(`Access-Control-Allow-Origin`, `*`);
    res.header(`Access-Control-Allow-Headers`, `Origin, X-Requested-With, Content-Type, Accept`);
    next();
});
const port = process.env.PORT || 8080;

const router = express.Router();

/*
███████ ██    ██ ███    ██  ██████ ████████ ██  ██████  ███    ██ ███████
██      ██    ██ ████   ██ ██         ██    ██ ██    ██ ████   ██ ██
█████   ██    ██ ██ ██  ██ ██         ██    ██ ██    ██ ██ ██  ██ ███████
██      ██    ██ ██  ██ ██ ██         ██    ██ ██    ██ ██  ██ ██      ██
██       ██████  ██   ████  ██████    ██    ██  ██████  ██   ████ ███████
*/
module.exports.remember = function(socketID, mod) {
    console.log("running the remember thingo")
    savedStates[socketID] = 'true'
    currentMods[socketID] = mod
}

module.exports.forget = function(socketID) {
  savedStates[socketID] = 'false'
  currentMods[socketID] = ''
}

module.exports.memeory = function(socketID) {
  if (savedStates[socketID] === 'true') {
    return currentMods[socketID]
  } else {
    return 'false'
  }
}

socketRegistration = ((passcode) => {
    savedStates[passcode] = 'false'
    clients.push(passcode);
    console.log(`remembering: ` + passcode);
})

socketRemovale = ((passcode) => {
    removeFromArray(savedStates, passcode);
    removeFromArray(clients, passcode);
    console.log(`forgotten: ` + passcode)
})

workItOut = (msg, usedSocket, socket) => {
    let toLoad = ``
    /* SAVING THIS FOR LATER...

    if (s_words && neg_score >= 2) {
        // We now need to reply with `Now now, there is no need for that talk...`
        return (`Now now, there is no need for that talk...`);
    } else if (!s_words && neg_score == 1) {
        // We now need to reply with `Your not being very nice.`
        return (`Your not being very nice.`);
    } else {
        return (`Sorry, I dont know how to help...`);
    }

    */
    let _got = nlp(msg).out(`normal`);
    let _test = _tokes = nlp(_got).terms().data();
    let _questionType = ``;
    let _firstWord = _tokes[0];

    const slang = [`whats`, `whos`, `whens`, `wheres`, `whys`, `hows`];
    const normal = [`what`, `who`, `when`, `where`, `why`, `how`];
    if (slang.indexOf(_firstWord.text) > -1) {
        pos = slang.indexOf(_firstWord.text);
        _firstWord = normal[pos];
        _questionType = _firstWord;
    } else {
        _ex = nlp(msg).contractions().expand().out(`normal`);
        _firstWord = _ex[0];
        _questionType = `what`;
    }

    // This is used for testing matches... to see if we can match a string to an example from a `words.txt` file.
    //let _testy = nlp(`whats 5 divide 5`).match(`whats #Value (plus|minus|divide|times) .? #Value .?`).found

    toLoad = getMod(mods, _mod_types, _questionType, msg)
    if (toLoad === ``) {
        toLoad = getMod(mods, _mod_types, `other`, msg);
        if (toLoad === ``) {
            return (`I am horribly sorry, but i just dont know what to respond...`);
        } else if (socketMods.indexOf(toLoad) > -1 && !usedSocket) {
            console.log(`Should not be able to run...`);
            return (`Sorry, to use this module. You need to connect to the server via socket.`);
        }
    }

    let wubbalubbadubdub = speak.classify(msg);
    let sub = wubbalubbadubdub.subject;
    if (sub === undefined) {
        sub = msg;
    }
    console.log('Running: "' + toLoad + '"')
    let _mod_to_run = allMods[toLoad];
    if (toLoad === 'casual' && usedSocket){
      return (_mod_to_run(sub, msg + "$$" + socket.id, socket, usedSocket))
    } else if (toLoad === 'casual' && !usedSocket){
      return (_mod_to_run(sub, msg, socket, usedSocket))
    }
    return (_mod_to_run(sub, msg, socket));
}



/*
███    ███  ██████  ██████  ███████
████  ████ ██    ██ ██   ██ ██
██ ████ ██ ██    ██ ██   ██ ███████
██  ██  ██ ██    ██ ██   ██      ██
██      ██  ██████  ██████  ███████
*/

console.log(`Configuring mods...`);
let allMods = {};
loadAllMods(allMods, _mod_types, true);

/*
██████   ██████  ██    ██ ████████ ███████ ███████
██   ██ ██    ██ ██    ██    ██    ██      ██
██████  ██    ██ ██    ██    ██    █████   ███████
██   ██ ██    ██ ██    ██    ██    ██           ██
██   ██  ██████   ██████     ██    ███████ ███████
*/

api_router.use((req, res, next) => {
    console.log(`Something is happening.`);
    next();
});



app.use(`/api`, api_router);

io.on(`connection`, (client) => {
    console.log(`Client connected...`);
    socketRegistration(client.id);
    client.on(`message`, data => {
        Promise.resolve(workItOut(data, true, client)).then((response) => {
            console.log(`responded with \`${response}\``);
            if (response !== `undefined`) {
                client.emit(`result`, String(response));
            }
        });
    });
    client.on(`disconnect`, function(){
      socketRemovale(client.id)
    })
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
    console.log(`Magic happens on port ${port}`);
}, 1000);

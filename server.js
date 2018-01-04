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
const builtinPhrases = require(`./builtins`);
const swears = [];
const _mod_types = {};
const mods = [];
const clients = [];
const socketMods = [`timers`];


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
const port = process.env.PORT || 80;

const api_router = express.Router();

/*
███████ ██    ██ ███    ██  ██████ ████████ ██  ██████  ███    ██ ███████
██      ██    ██ ████   ██ ██         ██    ██ ██    ██ ████   ██ ██
█████   ██    ██ ██ ██  ██ ██         ██    ██ ██    ██ ██ ██  ██ ███████
██      ██    ██ ██  ██ ██ ██         ██    ██ ██    ██ ██  ██ ██      ██
██       ██████  ██   ████  ██████    ██    ██  ██████  ██   ████ ███████
*/

socketRegistration = ((passcode) => {
    clients.push(passcode);
    console.log(`remembering: ` + passcode);
})

newToken = (() => {
    const generated = {};
    const generate = () => {
        const octets = [];
        for (let i = 0; i < 32; i++) {
            let octet = `${Math.round(Math.random() * 255).toString(16)}`;
            if (octet.length === 1) {
                octet = `0${octet}`;
            }
            octets.push(octet);
        }
        return (octets.join(`-`).toUpperCase());
    };
    const output = () => {
        let new_token = generate();
        while (generated[new_token] !== undefined) {
            new_token = generate();
        }
        generated[new_token] = true;
        return (new_token);
    };
    return output;
})();

getUser = ((user, cb = $ => $) => {
    User.findOne({
        username: user
    }, (err, user) => {
        if (err) { return (cb(false, null)); }
        if (!user) { return (cb(false, null)); }
        return (cb(true, user));
    });
});

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

    toLoad = getMod(mods, _mod_types, _questionType, msg);

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
    let _mod_to_run = allMods[toLoad];
    return (_mod_to_run(sub, msg, socket));
}

getMod = (_mods, _modTypes, _questionType, _msg) => {
    let holdme = ``;
    let _sentance;
    _mods.forEach((mod) => {
        if (_modTypes[mod] === _questionType) {
            _ins = [];
            fileToArray(`./mods/${mod}/words.txt`, _ins);
            _ins.forEach((_sentance) => {
                _sentance = _sentance.replace(/\r?\n?/gm, ``);
                _sentance.trim();
                let result = nlp(_msg).match(_sentance).found;
                if (result) {
                    console.log(`The module to run is: ${mod}`);
                    holdme = mod;
                }
            })
        }
    })
    return (holdme);
}


fileToArray = (file, list) => {
    const fs = require(`fs`);
    const array = fs.readFileSync(file).toString().split(`\n`);
    for (let i = 0; i < array.length; i++) {
        list.push(array[i]);
    }
}

findFilesAndFolders = (_path, _list, returnNamesOnly, checkForDir, checkForFile) => {
    fs.readdirSync(_path).forEach((file) => {
        if (checkForDir && !checkForFile) {
            if (fs.statSync(`${_path}${file}`).isDirectory()) {
                if (returnNamesOnly) {
                    _list.push(file);
                } else {
                    _list.push(`${_path}${file}`);
                }
            }
        } else if (!checkForDir && checkForFile) {
            if (fs.statSync(_path + file).isFile()) {
                _list.push(`${_path}${file}`);
            }
        } else {
            if (returnNamesOnly) {
                _list.push(file);
            } else {
                _list.push(`${_path}${file}`);
            }
        }
    });
}

trainAllMods = () => {
    findFilesAndFolders(`./mods/`, mods, true, true, false);
    mods.forEach((item) => {
        let holder = [];
        findFilesAndFolders(`./mods/${item}/`, holder, false, false, true)
        holder.forEach((file) => {
            if (file === `./mods/${item}/words.txt`) {
                teach(`./mods/${item}/words.txt`, item);
            }
        })
    })
    console.log(`Only found ${mods.length} mods`);
};

loadAllMods = (_all_Mods, _dict, loadType) => {
    findFilesAndFolders(`./mods/`, mods, true, true, false);
    mods.forEach((mod) => {
        let holder = [];
        findFilesAndFolders(`./mods/${mod}/`, holder, false, false, true);
        holder.forEach((file) => {
            if (file === `./mods/${mod}/mod.js`) {
                _all_Mods[mod] = require(`./mods/${mod}/mod.js`);
            }
            if (loadType) {
                if (file === `./mods/${mod}/type.txt`) {
                    _gotType = [];
                    fileToArray(file, _gotType);
                    _dict[mod] = _gotType[0];
                }
            }
        });
    });
};

/*const mods = {}; // global for convenience

loadAllMods = function(_dict) {
    let mods = []
    findFilesAndFolders(`./mods/`, mods, true, true, false)
    mods.forEach(function(mod) {
        let holder = []
        findFilesAndFolders(`./mods/` + mod + `/`, holder, false, false, true)
        holder.forEach(function(file) {
            if (file == `./mods/` + mod + `/mod.js`) {
              //Code here for assigning to the seperate arrays... (the name of the array should be the `mod` variable
              mods[mod] = mods[mod] || []; //will define if not defined, otherwise stays the same
              //put whatever you need into array
            }
        })
    })
}*/

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

api_router.route(`/login`)
    .post((req, res) => {
        const user = req.body.username || false;
        if (user === false) {
            return (res.status(401).send({
                status: `fail`,
                error: `No user provided!`
            }));
        }
        getUser(user, (exist, user) => {
            if (!exist) {
                return (res.status(401).send({
                    status: `fail`,
                    error: `User doesn\`t exist!`
                }));
            }
            const password = req.body.password || false;
            if (password === false) {
                return (res.status(401).send({
                    status: `fail `,
                    error: `No password supplied!`
                }));
            }
            user.comparePassword(password, (err, isMatch) => {
                if (isMatch && !err) {
                    const token = newToken();
                    return (res.json({
                        status: `success`,
                        message: `Login success!`,
                        token: token
                    }));
                }
            });
        });
    });

api_router.route(`/ signup`).post((req, res) => {
    if (!req.body.username || !req.body.password) {
        res.json({
            status: `fail`,
            error: `Please supply username and / or password!`
        });
    } else {
        var newUser = new User({
            username: req.body.username,
            password: req.body.password
        });
        newUser.save((err) => {
            if (err) {
                return (res.json({
                    status: `fail`,
                    error: `Username already exists.`
                }));
            }
            res.json({
                status: `success`,
                message: `Successfully created new user.`
            });
        });
    }
});


api_router.route(`/ talk`).post(function (req, res) {
    console.log(`Incomming...`);
    let command = req.body.command || null;
    if (command === null) {
        return (res.json({
            status: `fail`,
            error: `No command provided!`
        }));
    }
    console.log(`receiving \`${command}\``);
    //let response = workItOut(command);
    Promise.resolve(workItOut(command, false)).then((response) => {
        console.log(`responded with \`${response}\``);
        if (response !== `undefined`) {
            res.json({
                status: `success`,
                reply: response
            });
        } else {
            res.json({
                status: `unknown`
            })
        }
    });


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

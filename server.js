console.log(`Starting....`);
var express = require(`express`);
var app = express();
var morgan = require(`morgan`);
var bodyParser = require(`body-parser`);
var mongoose = require(`mongoose`);

var config = require(`./config/database`);
var User = require(`./models/user`);
var fs = require(`fs`);

var Asher = require(`./core/asher`)();
require(`./core/asherCommands`)(Asher);
// mods
require(`./mods/math`)(Asher);
require(`./mods/internet_query`)(Asher);
require(`./mods/natural-language`)(Asher);
require(`./mods/core`)(Asher);

var speak = require(`speakeasy-nlp`)
var NLP = require(`natural`);
var fs = require(`fs`);
var sentiment = require(`sentiment`);
var builtinPhrases = require(`./builtins`);
var swears = []
////////////////////////////////////////////////////////////////////////////////
//                              Setting up app                                //
////////////////////////////////////////////////////////////////////////////////
mongoose.connect(config.database);

app.use(morgan(`dev`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(function(req, res, next) {
    res.header(`Access-Control-Allow-Origin`, `*`);
    res.header(`Access-Control-Allow-Headers`, `Origin, X-Requested-With, Content-Type, Accept`);
    next();
});

var port = process.env.PORT || 8086;

var api_router = express.Router();

////////////////////////////////////////////////////////////////////////////////
//                              All our functions                             //
////////////////////////////////////////////////////////////////////////////////

newToken = (function() {
    var generated = {};
    var generate = (function() {
        var octets = [];
        for (var i = 0; i < 32; i++) {
            var octet = Math.round(Math.random() * 255).toString(16) + "";
            if (octet.length == 1) {
                octet = "0" + octet;
            }
            octets.push(octet);
        }
        return octets.join("-").toUpperCase();
    });
    var output = (function() {
        var new_token = generate();
        while (generated[new_token] !== undefined) {
            new_token = generate();
        }
        generated[new_token] = true;
        return new_token;
    });
    return output;
})();

getUser = (function(user, cb = (() => {})) {
    User.findOne({
        username: user
    }, function(err, user) {
        if (err) {
            return cb(false, null);
        }
        if (!user) {
            return cb(false, null);
        }
        return cb(true, user);
    });
});

workItOut = function(msg) {
    let holdGuess = interpret(msg);
    if (holdGuess.guess == null) {
        //We are now going to check how high the negativity of the message is..
        //if the negativity is -2 or below... we will make a comment of.
        // "Now now, there is no need for that talk..." [ ONLY RUN THIS IF WE FIND
        // SWEARS IN THE MESSAGE].
        let neg = speak.sentiment.negativity(msg)
        let neg_score = neg.score;
        let neg_words = neg.words;
        let s_words = false;
        neg_words.forEach(function(n_word) {
            swears.forEach(function(s_word) {
                if (n_word === s_word) {
                    s_words = true;
                }
            })
        })
        if (s_words && neg_score >= -2) {
            // We now need to reply with "Now now, there is no need for that talk..."
            return ("Now now, there is no need for that talk...");
        } else if (!s_words && neg_score >= -1) {
            // We now need to reply with "Your not being very nice."
            return ("Your not being very nice.");
        }
    } else {
        // We need to work out what module it is...
        let toLoad = holdGuess.guess;
        // We will also parse `sub` to the module incase it gives hints such as
        // `current time`...
        let sub = speak.classify(msg).subject;
        var mod = allMods[toLoad];
        return (mod(sub));
        // We now just need to execute the module that is associated with the name
        // inside the dictionary, that is loaded before...
    }
}

let minConfidence = 0.7
var classifier = new NLP.LogisticRegressionClassifier();

function toMaxValue(x, y) {
    return x && x.value > y.value ? x : y;
}

teach = function(theFile, label) {
    var fs = require(`fs`);
    var array = fs.readFileSync(theFile).toString().split("\n");
    for (i in array) {
        console.log(`Ingesting example for ` + label + `: ` + array[i]);
        classifier.addDocument(array[i], label);
    }
}

think = function() {
    classifier.train();
    // save the classifier for later use
    var aPath = `./core/classifier.json`;
    classifier.save(aPath, function(err, classifier) {
        // the classifier is saved to the classifier.json file!
        console.log(`Writing: Creating a Classifier file in SRC.`);
    });
};

interpret = function(phrase) {
    var guesses = classifier.getClassifications(phrase);
    var guess = guesses.reduce(toMaxValue);
    return {
        probabilities: guesses,
        guess: guess.value > minConfidence ? guess.label : null
    };
};

fileToArray = function(file, list) {
    var fs = require(`fs`);
    var array = fs.readFileSync(file).toString().split("\n");
    for (var i = 0; i < array.length; i++) {
        list.push(array[i]);
    }
    console.log(list);
}

findFilesAndFolders = function(_path, _list, returnNamesOnly, checkForDir, checkForFile) {
    fs.readdirSync(_path).forEach(file => {
        if (checkForDir && !checkForFile) {
            if (fs.statSync(_path + file).isDirectory()) {
                if (returnNamesOnly) {
                    _list.push(file)
                } else {
                    _list.push(_path + file)
                }
            }
        } else if (!checkForDir && checkForFile) {
            if (fs.statSync(_path + file).isFile()) {
                _list.push(_path + file)
            }
        } else {
            if (returnNamesOnly) {
                _list.push(file)
            } else {
                _list.push(_path + file)
            }
        }
    })
}

trainAllMods = function() {
    let mods = []
    findFilesAndFolders(`./mods/`, mods, true, true, false)
    mods.forEach(function(item) {
        let holder = [];
        findFilesAndFolders(`./mods/` + item + `/`, holder, false, false, true)
        holder.forEach(function(file) {
            if (file == `./mods/` + item + `/words.txt`) {
                teach(`./mods/` + item + `/words.txt`, item)
            }
        })
    })
    console.log("Only found " + mods.length + " mods")
}

loadAllMods = function(_dict) {
    let mods = []
    findFilesAndFolders(`./mods/`, mods, true, true, false)
    mods.forEach(function(mod) {
        let holder = []
        findFilesAndFolders(`./mods/` + mod + `/`, holder, false, false, true)
        holder.forEach(function(file) {
            if (file == `./mods/` + mod + `/mod.js`) {
                _dict[mod] = `./mods/` + mod + `/mod.js`
            }
        })
    })
}

////////////////////////////////////////////////////////////////////////////////
//                              Setting up mods                               //
////////////////////////////////////////////////////////////////////////////////
console.log(`Configuring mods...`);
fileToArray(`swears.txt`, swears)
let jokes = []
let commands = []
let allMods = {}
trainAllMods();
think();
loadAllMods(allMods);
console.log(allMods);

////////////////////////////////////////////////////////////////////////////////
//                              Setting up routes                             //
////////////////////////////////////////////////////////////////////////////////

api_router.use(function(req, res, next) {
    console.log(`Something is happening.`);
    next();
});

api_router.route(`/login`)
    .post(function(req, res) {
            var user = req.body.username || false;
            if (user === false) {
                return res.status(401).send({
                    status: `fail`,
                    error: `No user provided!`
                });
            }
            getUser(user, function(exist, user) {
                        if (!exist) {
                            return res.status(401).send({
                                        status: `fail`,
                                        error: `User doesn't exist!`
                });
            }
            var password = req.body.password || false;
            if (password === false) {
                return res.status(401).send({
                    status: `
                                        fail `,
                    error: `
                                        No password supplied!`
                });
            }
            user.comparePassword(password, function(err, isMatch) {
                if (isMatch && !err) {
                    var token = newToken();
                    return res.json({
                        status: `success`,
                        message: `Login success!`,
                        token: token
                    });
                }
            });
        });
    });

api_router.route(` / signup `)
    .post(function(req, res) {
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
            newUser.save(function(err) {
                if (err) {
                    return res.json({
                        status: `fail`,
                        error: `Username already exists.`
                    });
                }
                res.json({
                    status: `success`,
                    message: `Successfully created new user.`
                });
            });
        }
    });


api_router.route(`/talk`)
    .post(function(req, res) {
        console.log("Incomming...");
        var command = req.body.command || null;
        if (command === null) {
            return res.json({
                status: `fail`,
                error: `No command provided!`
            });
        }
        console.log(`receiving ${command}`);
        let response = workItOut(command);
        console.log(`responded with $ {response}`);
        res.json({
            status: "success",
            reply: response
        });
    });

app.use(`/api`, api_router);

////////////////////////////////////////////////////////////////////////////////
//                              Setting up listener                           //
////////////////////////////////////////////////////////////////////////////////
setTimeout(() => {
    app.listen(port);
    console.log(`Magic happens on port ${port}`);
}, 1000);

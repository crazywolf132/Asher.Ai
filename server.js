console.log(`Starting....`);
var express = require(`express`);
var app = express();
var morgan = require(`morgan`);
var bodyParser = require(`body-parser`);
var mongoose = require(`mongoose`);

var config = require(`./config/database`);
var User = require(`./models/user`);
var fs = require(`fs`);

var speak = require(`speakeasy-nlp`)
var nlp = require('compromise');
var fs = require(`fs`);
var sentiment = require(`sentiment`);
var builtinPhrases = require(`./builtins`);
var swears = []
var _mod_types = {}
var _who = {}
var _what = {}
var _when = {}
var _where = {}
var _why = {}
var _how = {}
var _other = {}
let mods = []
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
    /* SAVING THIS FOR LATER...

    if (s_words && neg_score >= 2) {
        // We now need to reply with "Now now, there is no need for that talk..."
        return ("Now now, there is no need for that talk...");
    } else if (!s_words && neg_score == 1) {
        // We now need to reply with "Your not being very nice."
        return ("Your not being very nice.");
    } else {
        return ("Sorry, I dont know how to help...");
    }

    */
    _got = nlp(msg).out('normal');
    _test =
    _tokes = nlp(_got).terms().data()
    let _questionType = ''
    //console.log(_tokes)
    _firstWord = _tokes[0]
    switch(_firstWord.text){
      case "whats":
        _firstWord = 'what'
        break
      case "whos":
        _firstWord = 'who'
        break
      case "whens":
        _firstWord = 'when'
        break
      case "wheres":
        _firstWord = 'wheres'
        break
      case "whys":
        _firstWord = 'why'
        break
      case "hows":
        _firstWord = 'how'
        break
      default:
        _ex = nlp(msg).contractions().expand().out('normal');
        _firstWord = _ex[0]
    }
    console.log(_firstWord)
    switch(_firstWord){
      case "what":
        _questionType = 'what';
        break;
      case "who":
        _questionType = 'who';
        break;
      case "when":
        _questionType = 'when';
        break;
      case "where":
        _questionType = 'where';
        break;
      case "why":
        _questionType = 'why';
        break;
      case "how":
        _questionType = 'how';
        break;
      default:
        // We are going to assume it is general conversation...
        _questionType = 'what';
    }
    console.log('Question type = ' + _questionType)


    mods.forEach(function(mod){
      if (_mod_types[mod] === _questionType){
        _ins = []
        fileToArray(`./mods/` + mod + `/words.txt`, _ins)
        _ins.forEach(function(_sentance){
            _sentance.replace(/\r?\n?/g, '')
            _sentance.trim()
            let r = nlp(_got)
            console.log(_sentance)
            let result = r.match(_sentance).found
            console.log(result)
            if (result){
              console.log('The module to run is: ' + mod)
            }
        })
      }
    })
    //console.log(_firstWord)
}

fileToArray = function(file, list) {
    var fs = require(`fs`);
    var array = fs.readFileSync(file).toString().split("\n");
    for (var i = 0; i < array.length; i++) {
        list.push(array[i]);
    }
    //console.log(list);
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
    findFilesAndFolders(`./mods/`, mods, true, true, false)
    mods.forEach(function(mod) {
        let holder = []
        findFilesAndFolders(`./mods/` + mod + `/`, holder, false, false, true)
        holder.forEach(function(file) {
            if (file == `./mods/` + mod + `/mod.js`) {
                _dict[mod] = require(`./mods/` + mod + `/mod.js`);
            }
            if (file == `./mods/` + mod + `/type.txt`) {
              _gotType = []
              fileToArray(file, _gotType)
              _dict[mod] = _gotType[0]
            }
        })
    })
}

/*const mods = {}; // global for convenience

loadAllMods = function(_dict) {
    let mods = []
    findFilesAndFolders(`./mods/`, mods, true, true, false)
    mods.forEach(function(mod) {
        let holder = []
        findFilesAndFolders(`./mods/` + mod + `/`, holder, false, false, true)
        holder.forEach(function(file) {
            if (file == `./mods/` + mod + `/mod.js`) {
              //Code here for assigning to the seperate arrays... (the name of the array should be the 'mod' variable
              mods[mod] = mods[mod] || []; //will define if not defined, otherwise stays the same
              //put whatever you need into array
            }
        })
    })
}*/

////////////////////////////////////////////////////////////////////////////////
//                              Setting up mods                               //
////////////////////////////////////////////////////////////////////////////////
console.log(`Configuring mods...`);
loadAllMods(_mod_types);
console.log(_mod_types)
/*fileToArray(`swears.txt`, swears)
let jokes = []
let commands = []
let allMods = {}
trainAllMods();
think();
loadAllMods(allMods);
console.log(allMods);*/

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
        console.log(`receiving '${command}'`);
        let response = workItOut(command);
        console.log(`responded with '${response}'`);
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

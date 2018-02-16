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
const modHandler = require("./core/functions/mod_handler");
const helper = require("./core/functions/helper");
const trainAllMods = modHandler.trainAllMods;
const loadAllMods = modHandler.loadAllMods;
const getMod = modHandler.getMod;
const fileToArray = helper.fileToArray;
const findFilesAndFolders = helper.findFilesAndFolders;
const swears = [];
const modTypes = {};
const mods = modHandler.mods;
var clients = [];
const socketMods = ["timers"];
let allMods = {};
// These next two arrays are for the users... For when saving state
// and allowing the continuation of a mod.
var savedStates = {};
var currentMods = {};
const apiRouter = require("./routes/api");
const homeRouter = require("./routes/home");

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
const port = process.env.PORT || 80;

const router = express.Router();

/*
███████ ██    ██ ███    ██  ██████ ████████ ██  ██████  ███    ██ ███████
██      ██    ██ ████   ██ ██         ██    ██ ██    ██ ████   ██ ██
█████   ██    ██ ██ ██  ██ ██         ██    ██ ██    ██ ██ ██  ██ ███████
██      ██    ██ ██  ██ ██ ██         ██    ██ ██    ██ ██  ██ ██      ██
██       ██████  ██   ████  ██████    ██    ██  ██████  ██   ████ ███████
*/
module.exports.remember = function(socketID, mod) {
	module.exports.logger("DEBUG", socketID + " is remembering " + mod);
	savedStates[socketID] = "true";
	currentMods[socketID] = mod;
};

module.exports.forget = function(socketID) {
	module.exports.logger("DEBUG", socketID + " is forgetting their module");
	savedStates[socketID] = "false";
	currentMods[socketID] = "";
};

module.exports.memeory = function(socketID) {
	module.exports.logger("DEBUG", "Loading memory for " + socketID);
	if (savedStates[socketID] === "true") {
		module.exports.logger("DEBUG", "There is a memory");
		return currentMods[socketID];
	} else {
		module.exports.logger("DEBUG", "There was no memory found");
		return "false";
	}
};

module.exports.activeMemory = memory = {};

module.exports.addResponder = (input, inArray, callback) => {
	inArray.forEach((item) => {
		if (nlp(input).match(item).found) {
			callback();
		}
	})
}

module.exports.logger = function(type, message) {
	if (type === "NORMAL" || type === "Normal" || type === "") {
		type = "INFO";
	} else if (type === "DEBUG" || type === "Debug") {
		type = "DBUG";
	}
	console.log("[" + type + "]  " + message);
};

socketRegistration = (passcode) => {
	savedStates[passcode] = "false";
	clients.push(passcode);
	module.exports.logger("NORMAL", "remembering: " + passcode);
};

socketRemovale = (passcode) => {
	delete savedStates[passcode];
	clients = clients.filter((clients) => clients !== passcode);
};

workItOut = (msg, usedSocket, socket) => {
	let toLoad = "";
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
	let _got = nlp(msg).out("normal");
	let _tokes = nlp(_got)
		.terms()
		.data();
	let _questionType = "";
	let _firstWord = _tokes[0];

	const slang = ["whats", "whos", "whens", "wheres", "whys", "hows"];
	const normal = ["what", "who", "when", "where", "why", "how"];
	if (slang.indexOf(_firstWord.text) > -1) {
		pos = slang.indexOf(_firstWord.text);
		_firstWord = normal[pos];
		_questionType = _firstWord;
	} else {
		_ex = nlp(msg)
			.contractions()
			.expand()
			.out("normal");
		_firstWord = _ex[0];
		_questionType = "what";
	}

	// This is used for testing matches... to see if we can match a string to an example from a "words.txt" file.
	//let _testy = nlp("whats 5 divide 5").match("whats #Value (plus|minus|divide|times) .? #Value .?").found
	let sub = speak.classify(msg).subject;
	if (sub === undefined) {
		sub = msg;
	}
	if (usedSocket) {
		_res = module.exports.memeory(socket.id);
		// If there happens to already be a mod in use... we will run that...
		// otherwise, there is no other catches... so we will continue onto the
		// rest of the code below...
		if (_res !== "false") {
			// We have detected a running mod, so we will work out what one... and
			// continue where left off. We will also forget the module, so then we
			// dont have module_devs forgetting to clear the memory.
			//module.exports.forget(socket.id);
			if (_res.indexOf("/") >= 0) {
				holder = _res.split("/");
				_res = holder[0];
			}
			let _mod_to_run = allMods[_res];
			return _mod_to_run(sub, msg, socket, usedSocket);
		}
	}

	// This is the rest of the code that will be run if there is no running mods...
	toLoad = getMod(mods, modTypes, _questionType, msg);
	if (toLoad === "") {
		toLoad = getMod(mods, modTypes, "other", msg);
		if (toLoad === "") {
			return checkNegativity(msg);
		} else if (socketMods.indexOf(toLoad) > -1 && !usedSocket) {
			return "Sorry, to use this module. You need to connect to the server via socket.";
		}
	}

	module.exports.logger("NORMAL", 'Running: "' + toLoad + '"');
	let _mod_to_run = allMods[toLoad];
	return _mod_to_run(sub, msg, socket, usedSocket);
};

checkNegativity = (msg) => {
	var s_words = false;
	swears.forEach(function(item){
		if (msg.indexOf(item) > -1) {
			s_words = true;
		}
	})
	var neg_score = speak.sentiment.negativity(msg).score;
	console.log(neg_score)
	if (s_words && neg_score >= 2) {
      // We now need to reply with "Now now, there is no need for that talk..."
      return("Now now, there is no need for that kind of talk...");
  } else if (!s_words && neg_score === 1) {
			console.log("There was no swear words...")
      // We now need to reply with "Your not being very nice."
      return("Your not being very nice me...");
  } else {
			console.log("There was no swear words, and it was a good neg_score")
      return("I am horribly sorry, but i just dont know what to respond...");
  }
}

/*
███    ███  ██████  ██████  ███████
████  ████ ██    ██ ██   ██ ██
██ ████ ██ ██    ██ ██   ██ ███████
██  ██  ██ ██    ██ ██   ██      ██
██      ██  ██████  ██████  ███████
*/

module.exports.logger("NORMAL", "Configuring mods...");
loadAllMods(allMods, modTypes, true);
fileToArray('swears.txt', swears);


/*
██████   ██████  ██    ██ ████████ ███████ ███████
██   ██ ██    ██ ██    ██    ██    ██      ██
██████  ██    ██ ██    ██    ██    █████   ███████
██   ██ ██    ██ ██    ██    ██    ██           ██
██   ██  ██████   ██████     ██    ███████ ███████
*/

app.use("/api", apiRouter);
app.use("/", homeRouter);

io.on("connection", (client) => {
	module.exports.logger("NORMAL", "Client connected...");
	socketRegistration(client.id);
	client.on("message", (data) => {
		Promise.resolve(workItOut(data, true, client)).then((response) => {
			module.exports.logger("NORMAL", "responded with " + response);
			if (response !== "undefined") {
				client.emit("result", String(response));
			}
			console.log("###########################################");
		});
	});
	client.on("disconnect", function() {
		module.exports.logger("NORMAL", "disconnected...");
		socketRemovale(client.id);
	});
});

/*
██      ██ ███████ ████████ ███████ ███    ██ ███████ ██████
██      ██ ██         ██    ██      ████   ██ ██      ██   ██
██      ██ ███████    ██    █████   ██ ██  ██ █████   ██████
██      ██      ██    ██    ██      ██  ██ ██ ██      ██   ██
███████ ██ ███████    ██    ███████ ██   ████ ███████ ██   ██
*/

setTimeout(() => {
	app.listen(port);
	module.exports.logger("NORMAL", "Magic happens on port " + port + "\n\n");
}, 1000);

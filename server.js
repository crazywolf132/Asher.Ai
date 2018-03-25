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
const mods = modHandler.mods;
const loadMods = modHandler.loadMods;
const fileToArray = helper.fileToArray;
const findFilesAndFolders = helper.findFilesAndFolders;
const fileToDict = helper.fileToDict;
const swears = [];
const modTypes = {};
var clients = [];
const socketMods = ["timers", "shoppingList", "activeMemory"];
const normal = ["what", "who", "when", "where", "why", "how"];
const dontRun = ['chat'];
var brainSaveTicker = 0;
let allMods = {};
// These next two arrays are for the users... For when saving state
// and allowing the continuation of a mod.
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

// I am doing this so the knowledge module doesnt have to make so many requests...
module.exports.cacheMemory = cacheMem = {};
// We can simply load the answe from here if we already have it...
module.exports.addCacheMemory = function(type, key, val) {
	console.log("cache being added too...")
	if (type in module.exports.cacheMemory) {
		if (key in module.exports.cacheMemory[type]) {
			// Well, it is already there... so we are just going to return a result...
			backupBrain();
			return 0;
			// We are returning 0, as it didnt work...
		} else {
			// The question hasnt been asked yet... YAY! learning!
			module.exports.cacheMemory[type][key] = val;
			backupBrain();
			return 1;
		}
	}
	
};

module.exports.activeMemory = memory = {};

module.exports.addActiveMemory = function(socketID, key, val) {
	module.exports.logger("INFO", socketID + " added something to active memory");
	if (socketID in module.exports.activeMemory) {
		module.exports.activeMemory[socketID][key] = val;
	} else {
		module.exports.activeMemory[socketID] = {};
		module.exports.activeMemory[socketID][key] = val;
	}
	backupBrain();
};

module.exports.addResponder = (input, inArray, callback) => {
	inArray.forEach((item) => {
		if (nlp(input).match(item).found) {
			callback();
		}
	});
};

module.exports.remember = function(socketID, mod) {
	module.exports.activeMemory[socketID].savedStatus = true;
	module.exports.activeMemory[socketID].currentMods = mod;
};

module.exports.forget = function(socketID) {
	module.exports.activeMemory[socketID].savedStatus = false;
	module.exports.activeMemory[socketID].currentMods = "";
};

module.exports.memeory = function(socketID) {
	if (module.exports.activeMemory[socketID].savedStatus) {
		return module.exports.activeMemory[socketID].currentMods;
	}
	return "false";
};

module.exports.logger = function(type, message) {
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
					console.log("I found them!!!")
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

returningUserWithID = (oldID, newID) => {
	// We are going to expect the id is already in the db. if not, we will
	// return the client that their information might have been lost.
	if (oldID in module.exports.activeMemory) {
		if (newID in module.exports.activeMemory) {
			return "We are sorry, but for some reason this id already has some memories..."
		} else {
			module.exports.activeMemory[newID] = module.exports.activeMemory[oldID];
			return "Welcome back. " + module.exports.activeMemory[newID].name;
		}
	} else {
		return "Sorry, but this ID never existed in memory, or never had any active memories..."
	}

}

loadBrain = () => {
	console.log("Loading the brain now...")
	let FE = module.exports.fileExists;
	/*console.log("cM = ");
	console.log(module.exports.cacheMemory)
	console.log("aM = ");
	console.log(module.exports.activeMemory)*/
	FE(process.cwd() + '/brain/cache.state') ? module.exports.cacheMemory = JSON.parse(fs.readFileSync(process.cwd() + '/brain/cache.state')) : module.exports.cacheMemory = {};
	//FE(process.cwd() + '/brain/memory.state') ? module.exports.activeMemory = JSON.parse(fs.readFileSync(process.cwd() + '/brain/memory.state')) : module.exports.activeMemory = {};
	/*console.log("cM = ");
	console.log(module.exports.cacheMemory)
	console.log("aM = ");
	console.log(module.exports.activeMemory)
	console.log("Brain loaded...")*/
	console.log(module.exports.cacheMemory)
}

arrayToFile = (file, item) => {
	const FE = module.exports.fileExists;
	var holder = file.split('/')
	holder.pop()
	var dir = holder.join('/')
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
	// we need to run a check to see if both are the exact same... as we dont want to keep adding garbage...
	if (FE(file)){
		var current = JSON.parse(fs.readFileSync(file));
		if (current === item) {
			console.log("They are the exact same... we will not update the brain...")
		} else {
			fs.writeFileSync(file, JSON.stringify(item))
		}
	} else {
		fs.writeFileSync(file, JSON.stringify(item))
	}
}

backupBrain = () => {
	let cM = module.exports.cacheMemory;
	let aM = module.exports.activeMemory;
	// First we need to go through the whole list of users... we need to see who
	// concented to having their data saved... if they didnt... they will be forgotten.
	//if (brainSaveTicker >= 1) {
		// This means we need to trigger a save... if not.. we will just increment it.
		// Seeing as there are 2 parts of the brain, the active memory... aswell as the cache memory. We
		// need to run 2 different savers...
		//helper.dictToFile(process.cwd() + '/brain/cache.state', cM);
	//testSaver(process.cwd() + '/brain/memory.state', module.exports.activeMemory);
	arrayToFile(process.cwd() + '/brain/cache.state', module.exports.cacheMemory);
	//} else {
	brainSaveTicker += 1;
	//}
}

socketRegistration = (id) => {
	module.exports.activeMemory[id] = {};
	module.exports.activeMemory[id].savedStatus = false;
	module.exports.logger("NORMAL", "remembering: " + id);
	module.exports.activeMemory[id].associations = [];
};

workItOut = (msg, usedSocket, socket) => {
	let toLoad = "";
	let _got = nlp(msg).out("normal");
	let _tokes = nlp(_got)
		.terms()
		.data();
	let _questionType = "";
	let _firstWord = _tokes[0];

	const slang = ["whats", "whos", "whens", "wheres", "whys", "hows"];
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
	//toLoad = "";
	if (toLoad === "") {
		toLoad = getMod(mods, modTypes, "other", msg);
		if (toLoad === "") {
			return checkNegativity(msg);
		} else if (dontRun.indexOf(toLoad) > -1) {
			return "Sorry, this module is currently under maintance. Please check back latter!";
		} else if (socketMods.indexOf(toLoad) < -1 && !userdSocket) {
			return "Sorry, to use this module. You need to connect to the server via socket.";
		}
	}

	module.exports.logger("NORMAL", 'Running: "' + toLoad + '"');
	let _mod_to_run = allMods[toLoad];
	return _mod_to_run(sub, msg, socket, usedSocket);
};

checkNegativity = (msg) => {
	var s_words = false;
	swears.forEach(function(item) {
		if (msg.indexOf(item) > -1) {
			s_words = true;
		}
	});
	var neg_score = speak.sentiment.negativity(msg).score;
	console.log(neg_score);
	if (s_words && neg_score >= 2) {
		// We now need to reply with "Now now, there is no need for that talk..."
		return "Now now, there is no need for that kind of talk...";
	} else if (!s_words && neg_score === 1) {
		console.log("There was no swear words...");
		// We now need to reply with "Your not being very nice."
		return "Your not being very nice me...";
	} else {
		console.log("There was no swear words, and it was a good neg_score");
		return "I am horribly sorry, but i just dont know what to respond...";
	}
};

/*
███████ ███████ ████████ ██    ██ ██████
██      ██         ██    ██    ██ ██   ██
███████ █████      ██    ██    ██ ██████
     ██ ██         ██    ██    ██ ██
███████ ███████    ██     ██████  ██
*/

//TODO: Need to create a system to ask for the credentials of the person, and if they
// accept the use of their information in the brain backup... as we dont want to have
// them explain everything to the brain all over again. As that would be stupid.

//TODO: We need to get the client side to send us the details the user has setup with...
// weather that be with them making an account on the client side or not... that is totally
// up to them. We just need the information some how. 

//TODO: Ask the client side via a different request if there is a a returning user or not.
// as we can now do a simple swap over to the new ID.

loadBrain();
module.exports.logger("NORMAL", "Configuring mods...");
loadAllMods(allMods, modTypes, true);
var modDB = {
	who: {},
	what: {},
	when: {},
	where: {},
	why: {},
	how: {},
	other: {},
}
loadMods(allMods, modDB, true);
console.log(modDB)
console.log(allMods)
fileToArray("swears.txt", swears);
//Pushing the knowledge module to the back of the line, as it should be the last
//to load. Eg. So it doesnt over-run the activeMemory...
mods.push(mods.splice(mods.indexOf("knowledge"), 1)[0]);
normal.forEach((item) => {
	module.exports.cacheMemory[item] = {};
});

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
		console.log(clients);
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

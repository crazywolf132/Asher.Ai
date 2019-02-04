import express from "express";
import core from "./core/Asher";
import morgan from "morgan";
import { json, urlencoded } from "body-parser";
import { middleware } from "stylus";
import { join } from "path";
import nlp from "compromise";
import { readdirSync, statSync } from "fs";

/**
* THE CORE OF THE SYSTEM...
*/

class Helper {
    constructor() {
        this.timeOfDay = Object.freeze({"Morning" : 1, "Midday" : 2, "Afternoon" : 3, "Evening" : 4, "Night" : 5, "MidNight" : 6});
        this.currentTime = this.getTime();
    }

    /*
     * This function should be able to be used by any of the modules to make re-active responses.
     */
    getTime() {
        var d = new Date();
        var hours = d.getHours();

        if (hours >= 1 && hours <= 11) {
            return this.timeOfDay.Morning;
        } else if (hours == 12) {
            return this.timeOfDay.Midday;
        } else if (hours >= 13 && hours <= 15) {
            return this.timeOfDay.Afternoon;
        } else if (hours >= 16 && hours <= 23) {
            return this.timeOfDay.Night;
        } else {
            return this.timeOfDay.MidNight;
        }
    }


}


class Server {
	constructor(helper) {
		this.Asher = new core(false, nlp);
		this.Asher.start();
		this.app = express();
		this.port = process.env.PORT || 80;
		this.nlp = nlp;
		this.helper = helper;
		this.homeRouter = require(process.cwd() + '/routes/home');
	}

	start() {
		this.app.use(morgan('dev'));
		this.app.use(json());
		this.app.use(urlencoded({ extended: true }));
		this.app.set('views', join(__dirname, 'views'));
		this.app.set('view engine', 'pug');
		this.app.use(middleware(join(__dirname, 'public')));
		this.app.use(express.static(join(__dirname, 'public')));
		this.app.use((req, res, next) => {
			res.header('Access-Control-Allow-Origin', '*');
			res.header(
				'Access-Control-Allow-Headers',
				'Origin, X-Requested-With, Content-Type, Accept'
			);
			next();
		});
		this.app.use('/', this.homeRouter);
		//this.Asher.loadHandlers("discord", "discord");
		this.Asher.loadOverloadModule('brain');
		this.Asher.start();
		this.loadAllMods();
		this.startServer();
	}

	startServer() {
		setTimeout(() => {
			this.app.listen(this.port);
		}, 1000);
	}

	loadAllMods() {
		let alreadyLoaded = [];
		let mods = [];
		this.findFilesAndFolders(process.cwd() + '/mods/', mods, true, true, false);
		mods.forEach(item => {
			if (!(item in alreadyLoaded)) {
				alreadyLoaded.push(item);
				let res = require(process.cwd() + `/mods/${item}/mod.js`);
				res.core(this);
			}
		});
	}

	findFilesAndFolders(
		_path,
		_list,
		returnNamesOnly,
		checkForDir,
		checkForFile
	) {
		readdirSync(_path).forEach(file => {
			if (checkForDir && !checkForFile) {
				if (statSync(_path + file).isDirectory()) {
					returnNamesOnly ? _list.push(file) : _list.push(_path + file);
				}
			} else if (!checkedForDir && checkForFile) {
				if (statSync(_path + file).isFile()) {
					_list.push(_path + file);
				}
			} else {
				returnNamesOnly ? _list.push(file) : _list.push(_path + file);
			}
		});
	}
};

const helper = new Helper();
const Asher = new Server(helper);
Asher.start();


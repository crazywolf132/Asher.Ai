import { readFileSync, writeFile, existsSync, readdirSync, statSync } from "fs";
import { closest } from "speakeasy-nlp";

class Brain {
    constructor() {
        this.brainFile = "asher.brain";
        this.previous_log_status = "";
        this.__unknown_phrases = [];
        this.__associationsDB = {};
        this.__reverse_associationsDB = {};
        this.loggerOnOff = true
    }

    start(logStatus = true) {
        this.loggerOnOff = logStatus;
        this.logger("Brain is starting...");
        this.loadNeurons();
        this.loadAxons();
        this.saveBrain();
        this.getBrainStats();
        //this.testBrain();
        return 1;
    }

    testStart() {
        return this.start(false);
    }

    loadNeurons() {
        this.logger("Now loading Neurons...", "warning");
        if (this.checkFileExists(process.cwd() + `/brain/` + this.brainFile)) {
            // Going to run the code to load the brain, otherwise we need to generate a brain....
            var fileContents = [];
            var counter = 0;
            var array = readFileSync(process.cwd() + `/brain/` + this.brainFile)
              .toString()
              .split("\n");
            for (let i = 0; i < array.length; i++) {
                if (array[i] !== "") {
                    var holder = array[i].replace("  ", "");
                    fileContents.push(holder);
                }
            }

            fileContents.forEach(item => {
                var line_part = item.split(" : ");
                var header = line_part[0].replace(".", "").toLowerCase();
                var response = line_part[1];
                if (header in this.__associationsDB) {
                    if (!this.__associationsDB[header].indexOf(response) > -1) {
                        this.__associationsDB[header].push(response);
                    }
                } else {
                    // Add it to this.__associationsDB
                    this.__associationsDB[header] = [];
                    this.__associationsDB[header].push(response);
                }

                if (counter % 10000 == 0) {
                    this.logger(`Loaded ${counter} iterations...`);
                }
                counter++;
            });
            this.logger(`FINISHED WITH ${counter} TOTAL ITERATIONS`);
        } else {
            var fileContents = [];
            var lastHeader = "";
            var counter = 0;
            if (this.checkFileExists(process.cwd() + "/train.yml")) {
                var array = readFileSync(process.cwd() + "/train.yml").toString().split("\n");
                for (let i = 0; i < array.length; i++) {
                    if (array[i] !== "") {
                        let holder = array[i].replace("  ", "");
                        fileContents.push(holder);
                    }
                }

                fileContents.forEach((item) => {
                    if (item.includes("- - ")) {
                        var holder = item.replace("- - ", "");
                        holder = holder.replace("?", "");

                        lastHeader = holder.toLowerCase().replace(".", "");
                    } else if (item.includes("- ")) {
                        var holder = item.replace("- ", "");
                        if (lastHeader in this.__associationsDB) {
                            if (!this.__associationsDB[lastHeader].indexOf(holder) > -1) {
                                this.__associationsDB[lastHeader].push(holder);
                            }
                        } else {
                            this.__associationsDB[lastHeader] = [];
                            this.__associationsDB[lastHeader].push(holder);
                        }
                    }
                    if (counter % 10000 == 0) {
                        this.logger(`Loaded ${counter} neurons...`);
                    }
                    counter++;
                });
                this.logger(`FINISHED WITH ${counter} TOTAL NEURONS`);
            } else {
                var allFileNames = [];
                this.findFilesAndFolders(process.cwd() + "/training_data/", allFileNames, false, false, true);
                allFileNames.forEach(file => {
                    var fileContents = [];
                    var currentFile = file.replace(".yml", "");
                    var array = readFileSync(file)
                        .toString()
                        .split("\n");
                    for (let i = 0; i < array.length; i++) {
                        if (array[i] !== "") {
                            let holder = array[i].replace("  ", "");
                            fileContents.push(holder);
                        }
                    }

                    fileContents.forEach((item) => {
                        if (item.includes("- - ")) {
                            var holder = item.replace("- - ", "");
                            holder = holder.replace("?", "");

                            lastHeader = holder.toLowerCase().replace(".", "");
                        } else if (item.includes("- ")) {
                            var holder = item.replace("- ", "");
                            if (lastHeader in this.__associationsDB) {
                                if (!this.__associationsDB[lastHeader].indexOf(holder) > -1) {
                                    this.__associationsDB[lastHeader].push(holder);
                                }
                            } else {
                                this.__associationsDB[lastHeader] = [];
                                this.__associationsDB[lastHeader].push(holder);
                            }
                        }
                        if (counter % 10000 == 0) {
                            this.logger(`Loaded ${counter} neurons...`);
                        }
                        counter++;
                    });
                });
                this.logger(`FINISHED WITH ${counter} TOTAL NEURONS`);
            }
        }
    }

    loadAxons() {
        var counter = 0;
        this.logger("Now loading Axons...", "warning");
        Object.keys(this.__associationsDB).forEach(key => {
            this.__associationsDB[key].forEach(val => {
                if (!(val in this.__reverse_associationsDB)) {
                    this.__reverse_associationsDB[val] = [];
                }
                this.__reverse_associationsDB[val].push(key);
                if (counter % 10000 == 0) {
                    this.logger(`Loaded ${counter} axons...`);
                }
                counter++;
            });
        });
        this.logger(`LOADED ${counter} TOTAL AXONS`)
    }

    getBrainStats() {
      this.logger(`There are ${Object.keys(this.__associationsDB).length} associations`, `warning`);
      this.logger(`There are ${Object.keys(this.__reverse_associationsDB).length} synapses`, `warning`);
    }

    testBrain() {
        this.logger("\n\n");
        this.logger(`Looking for "How are you"`);
        this.logger(`\nClosest is: `);
        this.logger(closest(`How are you`, Object.keys(this.__associationsDB)));
        this.logger(`Now checking the Synapses...`, 'warning');
        this.logger(`Looking for "good thankyou"`);
        let res = closest(`good thankyou`, Object.keys(this.__reverse_associationsDB));
        this.logger(`Question could have been... ${this.__reverse_associationsDB[res][Math.floor(Math.random() * this.__reverse_associationsDB[res].length)]}`);

    }

    saveBrain() {
        var lines = [];
        Object.keys(this.__associationsDB).forEach(key => {
            var line = "";
            this.__associationsDB[key].forEach(val => {
                if (key != "" && val != ""){
                    line = `${key} : ${val}`;
                    lines.push(line);
                }
            });
            if (lines.length % 10000 == 0) {
                this.logger(`Saved ${lines.length} neurons...`);
            }
        });
        this.arrayToFile(process.cwd() + `/brain/` + this.brainFile, lines);
    }

    getResponse(input) {
        try {
            var outputNum = this.__associationsDB[input][Math.floor(Math.random() * Object.keys(this.__associationsDB[input]).length)]
            return outputNum;
        } catch (error) {
            console.log(error);
            if (!input in this.__associationsDB || input in this.__reverse_associationsDB) {
                if (!(input in this.__unknown_phrases)) {
                    this.__unknown_phrases.push(input);
                }
            }
            return "-1";
        }
    }

    show() {
        //for (int i = 0; )
    }

    memories() {
        // TODO: Need to re-implement memories
    }

    wipe() {
        this.__unknown_phrases = null;
        this.__associationsDB = null;
        this.__reverse_associationsDB = null;
    }

    arrayToFile(file, array) {
        var holder = "";
        array.forEach((item) => {
            holder += item + "\n";
        })
        writeFile(file, holder, { flag: "w" }, () => {});
    }

    checkFileExists(filename) {
        return existsSync(filename) ? true : false;
    }

    findFilesAndFolders(
        _path,
        _list,
        returnNamesOnly,
        checkForDir,
        checkForFile
    ) {
        readdirSync(_path).forEach((file) => {
            if (checkForDir && !checkForFile) {
                if (statSync(_path + file).isDirectory()) {
                    if (returnNamesOnly) {
                        _list.push(file);
                    } else {
                        _list.push(_path + file);
                    }
                }
            } else if (!checkForDir && checkForFile) {
                if (statSync(_path + file).isFile()) {
                    _list.push(_path + file);
                }
            } else {
                if (returnNamesOnly) {
                    _list.push(file);
                } else {
                    _list.push(_path + file);
                }
            }
        });
    }

    logger(message, error = "info") {
        if (!this.loggerOnOff) {
            return;
        }
        if (this.previous_log_status == error) {
            console.log(`           | ${message}`);
            return;
        }
        this.previous_log_status = error;
        switch (error) {
            case "error":
                console.log(`   ERROR   | ${message}`);
                break;
            case "debug":
                console.log(`   DEBUG   | ${message}`);
                break;
            case "":
            case "normal":
            case "none":
                console.log(`   INFO    | ${message}`);
                break;
            case "warning":
                console.log(`   WARNING | ${message}`);
                break;
            default:
                console.log(`   INFO    | ${message}`);
                break;
        }
    }
}

export default Brain;
"use strict";

import EventEmitter from "eventEmitter3";
import Chat from "./Chat";
import Conversation from "./Conversation";
import { existsSync } from "fs";

class Asher extends EventEmitter {
  constructor(options, nlp) {
    super();
    this.nlp = nlp;
    this.listener = !options
      ? null
      : options.listener
        ? options.listener
        : null;
    this.name = !options ? "Asher" : options.name ? options.name : "Asher";
    this.devMode = !options ? true : options.devMode ? options.devMode : true;
    this.actions = [];
    this._conversations = [];
    this.port = 4416;
    this.handlers = { loaded: false };
    this.middleWear = { loaded: false };
    this.serverRunning = false;
  }

  start() {
    if (this.handlers.loaded) {
      let runMe = this.handlers.listener;
      new runMe(this);
    } else {
      if (!this.serverRunning) {
        const io = require("socket.io").listen(this.port);
        // io.listen((!port) ? this.port : port);
        io.sockets.on("connection", socket => {
          socket.on("command", mess => {
            this.getMessage(mess, socket);
          });
          socket.on("verify", pass => {
            socket.emit("verify_status", true);
          });
        });
        this.serverRunning = true;
      }
    }
  }

  loadHandlers(listener, responder) {
    if (this.handlers.loaded)
      return "Sorry, but you can only have 1 handlers running at a time...";
    if (
      existsSync(process.cwd() + `/listeners/${listener}.js`) &&
      existsSync(process.cwd() + `/responders/${responder}.js`)
    ) {
      this.handlers.listener = require(process.cwd() +
        `/listeners/${listener}`);
      this.handlers.responder = require(process.cwd() +
        `/responders/${responder}.js`);
      this.handlers.loaded = true;
    }
  }

  loadMod(mod) {
    if (existsSync(process.cwd() + `/mods/${mod}.js`)) {
      this.mods[mod] = require(process.cwd() + `/mods/${mod}.js`);
    }
  }

  loadOverloadModule(mod) {
    if (existsSync(process.cwd() + `/overLoader/${mod}.js`)) {
      this.handlers['overLoader'] = require(process.cwd() + `/overLoader/${mod}.js`);
      this.handlers.overLoader.preRun();
    }
  }

  loadMiddleWear(middle) {
    if (this.middleWear.loaded) {
      return "Sorry, you can only load 1 middlewear at a time.";
    } else {
      if (existsSync(process.cwd() + `/middlewear/${middle}.js`)) {
        this.middleWear["import"] = require(process.cwd() +
          `/middlewear/${middle}.js`);
        this.middleWear.loaded = true;
      }
    }
  }

  shareAtts(key, val) {
    if (!("atts" in this.handlers)) {
      this.handlers.atts = {};
    }
    this.handlers.atts[key] = val;
  }

  hear(keywords, callback) {
    keywords = Array.isArray(keywords) ? keywords : [keywords];
    keywords.forEach(keyword => this.actions.push({ keyword, callback }));
    return this;
  }

  conversation(ID, factory) {
    if (this.handlers.atts.message) ID = this.handlers.atts.message.author;
    if (!ID || !factory || typeof factory !== "function") {
      return console.error(
        `You need to specify a recipient and a callback to start a conversation`
      );
    }
    const convo = new Conversation(this, ID);
    this._conversations.push(convo);
    convo.on("end", endedConvo => {
      const removeIndex = this._conversations.indexOf(endedConvo);
      this._conversations.splice(removeIndex, 1);
    });
    factory.apply(this, [convo]);
    return convo;
  }

  convo_response(ID, data) {
    if (!this.handlers.atts) {
       return false
    }
    if (this.handlers.atts.message) ID = this.handlers.atts.message.author;
    const userID = ID;
    let captured = false;
    this._conversations.forEach(convo => {
      if (userID && userID == convo.userID && convo.isActive()) {
        captured = true;
        return convo.respond(ID, data);
      }
    });
    return captured;
  }

  getMessage(text, socket) {

    if (this.convo_response(socket, text)) {
      console.log("oh no")
      return;
    }
    let alreadyFound = false;
    this.actions.forEach(hear => {
      if (
        typeof hear.keyword === "string" &&
        this.nlp(text.toLowerCase()).match(hear.keyword.toLowerCase()).found &&
        !alreadyFound
      ) {
        alreadyFound = true;
        const res = hear.callback.apply(this, [
          { keyword: hear.keyword },
          new Chat(this, socket), {found : text}
        ]);
        return res;
      }
    });
    // We are here because we couldnt find a message that we know...
    // So now we will check to see if there are any overLoaders present.
    // If there is, we will run that.
    if (this.handlers.overLoader && !alreadyFound) {
      alreadyFound = true;
      let loader = this.handlers.overLoader;
      loader.core({ found: text }, new Chat(this, socket));
      return loader;
    }
  }

  say(userID, message) {
    return new Promise((resolve, reject) => {
        if (this.handlers.loaded) {
            let runMe = this.handlers.responder;
            new runMe(this, userID, message);
        } else {
            userID.emit("response", message);
        }
        resolve("done");
    });

  }
}

export default Asher;

"use strict";

import EventEmitter from "eventEmitter3";

class Chat extends EventEmitter {
  constructor(core, userID) {
    super();
    if (!core || !userID) {
      throw new Error("You need to specify a core and a userID");
    }
    this.handler = core;
    this.userID = userID;
  }

  say(message) {
    return this.handler.say(this.userID, message);
  }

  conversation(factory) {
    return this.handler.conversation(this.userID, factory);
  }
}

export default Chat;
"use strict";
import Chat from `./Chat`;

class Conversation extends Chat {
    constructor(core, userID) {
        super(core, userID);
        this.handler = core;
        this.userID = userID;
        this.context = {};
        this.waitingForAnswer = false;
        this.start();
    }

    ask(question, answer, callbacks) {
        if (!question || !answer || typeof answer !== "function") {
            return console.error(`You need to specify a question and answer to ask`);
        }
        if (typeof question === "function") {
            question.apply(this, [this]);
        } else {
            this.say(question);
        }
        this.waitingForAnswer = true;
        this.listeningAnswer = answer;
        this.listeningCallbacks = Array.isArray(callbacks)
            ? callbacks
            : callbacks
                ? [callbacks]
                : [];
        return this;
    }

    respond(payload, data) {
        if (!this.isWaitingForAnswer()) {
            return;
        }

        const patternCallbacks = this.listeningCallbacks.filter(
            callbackObject => callbackObject.pattern !== undefined        
        );
        if (patternCallbacks.length > 0) {
            for (let i = 0; i < patternCallbacks.length; i++) {
                const match = true;
                if (match !== false) {
                    this.stopWaitingForAnswer();
                    data.keyword = match.keyword;
                    if (match.match) {
                        data.match = match.match;
                    }
                    return patternCallbacks[i].callback.apply(this, [payload, this, data]);
                }
            }
        }

        if (this.listeningAnswer && typeof this.listeningAnswer === "function") {
            const listeningAnswer = this.listeningAnswer;
            this.listeningAnswer = null;
            listeningAnswer.apply(this, [payload, this, data]);
            return this;
        }

        return this.end();
    }

    isActive() {
        return this.active;
    }

    isWaitingForAnswer() {
        return this.waitingForAnswer;
    }

    stopWaitingForAnswer() {
        this.waitingForAnswer = false;
        this.listeningCallbacks = [];
    }

    start() {
        this.active = true;
        return this;
    }

    end() {
        this.active = false;
        return this;
    }
}

export default Conversation;
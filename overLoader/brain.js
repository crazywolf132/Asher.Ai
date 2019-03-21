//import B from "../core/functions/latestBrain";
// const B = require(`${process.cwd()}/core/functions/latestBrain`);
import { workOut, startBrain } from "../build/Release/brain";
//const newBrain = new B();

export function core(payload, chat) {
    /*let response = "";
    response = newBrain.getResponse(
        payload.found.includes("?") ?
        payload.found.replace("?", "").toLowerCase() :
        payload.found.toLowerCase());
        
    if (response == "-1") {
        // This means we have an issue and need to work out what to do.
        //response = thinking(chat, payload.found);
        response = "Shiiit... idk how to respond to that. Sorry.";
    }
    chat.say(response);*/

    let response = "";
    response = workOut(payload.found.includes("?") ? payload.found.replace("?", "").toLowerCase() : payload.found.toLowerCase());

    if (response == "-1") {
        // This means that we have an issue, and the brain doesnt know how to respond to this.
        response = "Im sorry, but i dont know how to respond to that yet."
    }
    chat.say(response);
}

export function preRun() {
    startBrain();
}
//🏢🏢✈💨 ☝🎅👍
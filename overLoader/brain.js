import B from "../core/functions/latestBrain";
// const B = require(`${process.cwd()}/core/functions/latestBrain`);
const newBrain = new B();

export function core(payload, chat) {
    let response = "";
    response = newBrain.getResponse(
        payload.found.includes("?") ?
        payload.found.replace("?", "").toLowerCase() :
        payload.found.toLowerCase());
        
    if (response == "-1") {
        // This means we have an issue and need to work out what to do.
        //response = thinking(chat, payload.found);
        response = "Shiiit... idk how to respond to that. Sorry.";
    }
    chat.say(response);
}

export function preRun() {
    newBrain.start();
}
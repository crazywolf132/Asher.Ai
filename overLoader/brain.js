import { workOut, startBrain } from "../build/Release/brain";

export function core(payload, chat) {
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
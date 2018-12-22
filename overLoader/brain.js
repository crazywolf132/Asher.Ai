const brain = require(process.cwd() + `/core/functions/brain`);
const voice = brain.getResponse;
const thinking = brain.worker;
const B = require(`${process.cwd()}/core/functions/latestBrain`);
const newBrain = new B();

module.exports.core = (payload, chat) => {
    let response = "";
    //console.log(payload[0].found);
    console.log("======================");
    console.log(payload);
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

module.exports.preRun = () => {
    newBrain.start();
    //newBrain.testBrain();
    //console.log(newBrain.getResponse("How are you"));
   // newBrain.saveBrain();
}
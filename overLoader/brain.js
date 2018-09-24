const brain = require(process.cwd() + `/core/functions/brain`);
const voice = brain.getResponse;
const thinking = brain.worker;

module.exports.core = (payload, chat) => {
    let response = "";
    response = voice(payload.found.replace("?", ""));
    if (response == "-1") {
        // This means we have an issue and need to work out what to do.
        response = thinking(chat, payload.found);
    }
    chat.say(response);
}

module.exports.preRun = () => {
    const B = require(`${process.cwd()}/core/functions/latestBrain`);
    const newBrain = new B();
    //console.time("brain1");
    //brain.loadBrain();
    //brain.generateBackLinkBrain();
    //brain.getInfo();
    //console.timeEnd("brain1");
    console.time("brain2");
    newBrain.start();
    console.timeEnd("brain2");
}
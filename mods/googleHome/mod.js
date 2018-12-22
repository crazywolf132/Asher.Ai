module.exports.core = (core) => {
    memory = {};

    // Do all the modules from the google home here...
    core.Asher.hear(['Good? night'], (payload, chat) => {
        chat.say("Good night");
    });

    core.Asher.hear(['Remember *?'], (payload, chat) => {
        console.log("shit...");
    });
}
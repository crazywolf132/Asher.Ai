module.exports.core = (core) => {
    memory = {};

    core.Asher.hear(['Remember *?'], (payload, chat) => {
        console.log("shit...");
    });
}
module.exports.core = (core) => {
    core.Asher.hear(['Good? night'], (payload, chat) => {
        if (core.monitor.helper.getTime() == core.monitor.helper.timeOfDay.night) {
            chat.say(`Good night`);
        }
    });
}
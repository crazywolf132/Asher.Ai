module.exports.core = (core) => {
    core.Asher.hear(['Good? night'], (payload, chat) => {
        if (core.helper.getTime() == core.helper.timeOfDay.night) {
            chat.say(`Good night`);
        } else {
            chat.say(`Nigga... u confused?`)
        }
    });
}
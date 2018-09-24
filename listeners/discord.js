var Discord = require('discord.js');
var auth = require(process.cwd() + `/config/auth.js`);

class DiscordListener {
    constructor(core) {
        this.core = core;
        this.bot = new Discord.Client();
        this.bot.login(auth.token);

        this.core.shareAtts('bot', this.bot);
        this.start();
    }

    start() {
        this.bot.on('ready', (evt) => {
            console.log('Connected');
            console.log(`Logged in as ${this.bot.user.tag}`);
        });

        this.bot.on('message', msg => {
            if (msg.content.charAt(0) == auth.prefix) {
                this.core.shareAtts("message", msg);
                this.core.getMessage(msg.content.substring(1), msg);
            } 
        });
    }
}

module.exports = DiscordListener;
class DiscordResponder {
    constructor(core, recipient, mess) {
        this.core = core;
        this.recipient = this.core.handlers.atts.message;
        this.message = mess;
        this.bot = this.core.handlers.atts['bot'];
        //console.log(this.core.handlers.atts['bot']);
        this.respond(this.recipient, this.message);
    }

    respond(recipient, message) {
        recipient.reply(message);
    }
}

module.exports = DiscordResponder;
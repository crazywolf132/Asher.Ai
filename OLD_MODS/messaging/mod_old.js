module.exports = async(subject, message, userID, respond) => {
    const core = require(process.cwd() + "/server");
    const messenger = require(process.cwd() + "/core/functions/messenger_handler");
    let splits = message.split(" ");
    console.log(splits)
    let grabbedToken = splits[splits.length -1];
    console.log(grabbedToken)
    messenger.respond(grabbedToken, "Hey there! Your friend surgested i come and say Hi. So... HI!");
    respond(userID, "I messaged them!");
}
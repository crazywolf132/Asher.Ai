module.exports = async (subject, message, userID, respond) => {
    let response = "";
    let voice = require(process.cwd() + '/core/functions/brain').getResponse;
    let thinking = require(process.cwd() + '/core/functions/brain').worker;
    response = voice(message.replace("?",""));
    if (response == "-1") {
        // This means we have an issue... and we need to work out what to do...
        response = thinking(userID, message);
    }
    console.log(response)
    respond(userID, response);
};
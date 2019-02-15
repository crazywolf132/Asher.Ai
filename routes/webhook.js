import { Router } from "express";
var router = Router();
const core = require(process.cwd() + "/server");
const messenger = require(process.cwd() + "/core/functions/messenger_handler");
const seenMessage = messenger.seenMessage;
const greetingMessage = messenger.setGreetingText;
const startedMessage = messenger.setGetStartedButton;

router.route("/").post((req, res, next) => {

    let messaging_events = req.body.entry[0].messaging;
    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i];
      let sender = event.sender.id;
      if (event.message && event.message.text) {
        let text = event.message.text;
        seenMessage(sender);
        getRequest(text, sender);
        //sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200));
      }
    }
    res.sendStatus(200);
})

function getRequest(message, sender) {
    // check to see if sender is recorded in db...
    // if it is... then send the request to answer the question.
    // else, add them... then send the request.
    if (sender in core.activeMemory) {
        core.runInput(message, sender);
    } else {
        core.socketRegistration(sender, sender, true);
        startedMessage("Howdy Partner!");
        greetingMessage("Welcome! My name is Asher, and i will be your virtual tour guide today. It is nice to see a new face around here!")
        core.runInput(message, sender);
    }
}

export default router;
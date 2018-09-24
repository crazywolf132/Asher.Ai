module.exports.core = (core) => {
    let words = [
        `.? set timer for #Value (second|minute|hour|seconds|minutes|hours) .?`,
        `.? set .? timer for #Value (second|minute|hour|seconds|minutes|hours) .?`,
        `.? remind me to .? in #Value (second|minute|hour|seconds|minutes|hours) .?`,
        `.? remind me to do .? in #Value (second|minute|hour|seconds|minutes|hours) .?`
    ];
    core.Asher.hear(words, (payload, chat, data) => {
        const msg = core
          .nlp(data.found)
          .match("#Value .")
          .out("text");
        var holder;
        var reminder = core
          .nlp(data.found)
          .match("remind me to do? .?");
        var toRemind = "";
        // Here we are trying to split the message if there is the "remind me" text.
        // We are going to grab the last variable as that should always be the item we
        // need to remember.
        if (reminder.found) {
          holder = reminder.out("text").split(" ");
          toRemind = holder[-1];
        }

        // Here we are working out what the time frame is. 
        // Both the unit of measurement aswell as the avtual time value.
        holder = msg.split(" ");
        const time = holder[1];
        const unit = holder[2];
        // This is here so people can set certain reminders...
        var details;
        if (reminder.found) {
            details = core.nlp(data.found).match("to . in").out("text");
            details = details.split(" ");
            details = details[2];
        }

        setTimer(time, unit, () => chat.say(reminder.found ? `Remember to ${details}` : "Timer is going off now!"));
        
        chat.say(reminder.found ? "reminder is set" : "timer is set");
    });
}

function unitMultiplier(unit) {
  if (unit === "hour" || unit === "hours") {
    return 60 * 60;
  } else if (unit === "minute" || unit === "minutes") {
    return 60;
  } else if (unit === "second" || unit === "seconds") {
    return 1;
  }
}

function setTimer(quantity, unit, callback) {
  const Timer = require("timer.js");
  if (quantity && unit) {
    const duration = quantity * unitMultiplier(unit);
    const timer = new Timer();
    timer.start(duration).on("end", () => callback.call());
  }
}
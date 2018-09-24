module.exports.core = (core) => {
    let words = [
        `.? set timer for #Value (second|minute|hour|seconds|minutes|hours) .?`,
        `.? set .? timer for #Value (second|minute|hour|seconds|minutes|hours) .?`,
        `.? remind me to .? in #Value (second|minute|hour|seconds|minutes|hours) .?`,
        `.? remind me to do .? in #Value (second|minute|hour|seconds|minutes|hours) .?`
    ];
    core.Asher.hear(words, (payload, chat, data) => {
        console.log(data);
        console.log(core.nlp)
        const msg = core
          .nlp(data.found)
          .match("#Value .")
          .out("text");
        console.log(msg);
        var holder;
        var reminder = core
          .nlp(payload.keyword)
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
        console.log(unit);
        console.log(time);
        // This is here so people can set certain reminders...
        if (reminder.found) {
            setTimer(time, unit, () => chat.say("remember to "))
        } else {
            console.log("Setting a timer");
            setTimer(time, unit, () => chat.say("timer is going off now!"));
        }

        chat.say(reminder ? "reminder is set" : "timer is set");
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
module.exports = async(subject, message, userID, respond) => {
	const msg = nlp(message)
		.match("#Value .")
		.out("text");
	var holder;
	var reminder = nlp(message).match("remind me to do? .?");
	var toRemind = ""
	// Here we are trying to split the message if there is the "remind me" text.
	// We are going to grab the last variable as that should always be the item we 
	// need to remember.
	if (reminder.found) { 
		holder = reminder.out("text").split(" ")
		toRemind = holder[-1]
	}
	// Here we are working out what the time frame is. 
	// Both the unit of measurement aswell as the avtual time value.
	holder = msg.split(" ");
	const time = holder[1];
	const unit = holder[2];
	// This is here so people can set certain reminders...
	if (reminder.found) {
		setTimer(time, unit, () => respond(userID, "remember to "))
	} else {
		setTimer(time, unit, () => respond(userID, "timer is going off now!"));
	}
	// This little 3 line part is to work out what to return to the user...
	var returner = "";
	// If it is reminder mode... we will return a message about setting a reminder.
	// otherwise, we will just return a message saying that the timer is set.
	reminder ? (returner = "reminder is set") : (returner = "timer is set");
	respond(userID, returner);
};

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

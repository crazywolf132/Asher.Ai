module.exports = async (subject, message, socket, socketUsed) => {
	const msg = nlp(message)
		.match("#Value .")
		.out("text");
	const holder = msg.split(" ");
	console.log(holder);
	const time = holder[1];
	const unit = holder[2];
	setTimer(time, unit, () => socket.emit("result", "timer is going off now!"));
	return "timer is set";
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

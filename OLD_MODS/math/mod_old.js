module.exports = async (subject, message, userID, respond) => {
	// We are going to convert the word to a symbol...
	let msg = nlp(message)
		.match("#Value . #Value")
		.out("text");
	let holder = msg.split(" ");
	let num1;
	let num2;
	let word;
	if (holder.length >= 4) {
		num1 = holder[1];
		word = holder[2];
		num2 = holder[3];
	} else {
		num1 = holder[0];
		word = holder[1];
		num2 = holder[2];
	}
	switch (word) {
		case "plus":
			respond(userID, parseInt(num1) + parseInt(num2));
			break;
		case "minus":
			respond(userID, parseInt(num1) - parseInt(num2));
			break;
		case "devide":
			respond(userID, parseInt(num1) / parseInt(num2));
			break;
		case "times":
			respond(userID, parseInt(num1) * parseInt(num2));
			break;
		case "+":
			respond(userID, parseInt(num1) + parseInt(num2));
			break;
		case "-":
			respond(userID, parseInt(num1) - parseInt(num2));
			break;
		case "/":
			respond(userID, parseInt(num1) / parseInt(num2));
			break;
		case "*":
			respond(userID, parseInt(num1) * parseInt(num2));
			break;
		case "x":
			respond(userID, parseInt(num1) * parseInt(num2));
			break;
		default:
			respond(userID, "Please try again.");
	}
};

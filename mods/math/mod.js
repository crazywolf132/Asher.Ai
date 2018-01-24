module.exports = async (subject, message, socket, socketUsed) => {
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
			return parseInt(num1) + parseInt(num2);
			break;
		case "minus":
			return parseInt(num1) - parseInt(num2);
			break;
		case "devide":
			return parseInt(num1) / parseInt(num2);
			break;
		case "times":
			return parseInt(num1) * parseInt(num2);
			break;
		case "+":
			return parseInt(num1) + parseInt(num2);
			break;
		case "-":
			return parseInt(num1) - parseInt(num2);
			break;
		case "/":
			return parseInt(num1) / parseInt(num2);
			break;
		case "*":
			return parseInt(num1) * parseInt(num2);
			break;
		case "x":
			return parseInt(num1) * parseInt(num2);
			break;
		default:
			return "Please try again.";
	}
};

export function core(core) {
    let words = [
        "whats #Value (plus|minus|take|remove|negative|+|-|*|/|x|divide|times) .? #Value .?",
        "what's #Value (plus|minus|take|remove|negative|+|-|*|/|x|divide|times) .? #Value .?",
        "what is the value of #Value (plus|minus|take|remove|negative|+|-|*|/|x|divide|times) .? #Value .?",
        "what is the sum of whats #Value (plus|minus|take|remove|negative|+|-|*|/|x|divide|times) .? #Value .?",
        "solve #Value (plus|minus|take|remove|negative|+|-|*|/|x|divide|times) .? #Value .?",
        "what is #Value (plus|minus|take|remove|negative|+|-|*|/|x|divide|times) .? #Value .?",
        "show me #Value (plus|minus|take|remove|negative|+|-|*|/|x|divide|times) .? #Value .?"
    ];
    core.Asher.hear(words, (payload, chat, data) => {
        let msg = core.nlp(data.found)
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
            chat.say(parseInt(num1) + parseInt(num2));
            break;
          case "minus":
            chat.say(parseInt(num1) - parseInt(num2));
            break;
          case "devide":
            chat.say(parseInt(num1) / parseInt(num2));
            break;
          case "times":
            chat.say(parseInt(num1) * parseInt(num2));
            break;
          case "+":
            chat.say(parseInt(num1) + parseInt(num2));
            break;
          case "-":
            chat.say(parseInt(num1) - parseInt(num2));
            break;
          case "/":
            chat.say(parseInt(num1) / parseInt(num2));
            break;
          case "*":
            chat.say(parseInt(num1) * parseInt(num2));
            break;
          case "x":
            chat.say(parseInt(num1) * parseInt(num2));
            break;
          default:
            chat.say("Sorry, I don't know what you want me to do.");
        }
    });
}
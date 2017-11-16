module.exports=(
  function(input){
    // We are going to convert the word to a symbol...
    var [num1, word, num2] = input.split(' ');
    switch(word) {
      case "plus":
          let math = num1 + num2;
          return math;
          break;
      case "minus":
          return (num1-num2);
          break;
      case "devide":
          return (num1/num2);
          break;
      case "times":
          return (num1*num2);
          break;
      case "+":
          return (num1+num2);
          break;
      case "-":
          return (num1-num2);
          break;
      case "/":
          return (num1/num2);
          break;
      case "*":
          return (num1*num2);
          break;
      default:
          ""
    }
  }
);

module.exports=(
  function(input){
    // We are going to convert the word to a symbol...
    let holder = input.split(' ');
    let num1;
    let num2;
    let word;
    if (holder.length >= 4){
      num1 = holder[1]
      word = holder[2]
      num2 = holder[3]
    }else{
      num1 = holder[0]
      word = holder[1]
      num2 = holder[2]
    }
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

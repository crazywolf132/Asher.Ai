module.exports=(function(Asher){
  // addition
  // what is 4 + 5
  Asher.addResponder(/(What is|What's)?\s?([\d.]+) \+ ([\d.]+)/i, function(){
    var a = parseFloat(RegExp.$2);
    var b = parseFloat(RegExp.$3);
    var r = a + b
    var response = (number(a)+` + `+number(b)+` is`+ number(r))
    Asher.respond(response);
  })

  // subtraction
  // what is 10 minus 5
  Asher.addResponder(/(What is|What's)?\s?([\d.]+) - ([\d.]+)/i, function(){
    var a = parseFloat(RegExp.$2);
    var b = parseFloat(RegExp.$3);
    var r = a - b
    var response = (number(a)+` minus `+number(b)+` is`+ number(r))
    Asher.respond(response);
  })

  // multiplication
  // what is 2 multiplied by 10
  Asher.addResponder(/(What is|What's)?\s?([\d.]+) x ([\d.]+)/i, function(){
    var a = parseFloat(RegExp.$2);
    var b = parseFloat(RegExp.$3);
    var r = a * b;
    var response = (number(a)+` multiplied by `+number(b)+` is`+ number(r))
    Asher.respond(response);
  })

  // division
  // what is 10 divided by 2
  Asher.addResponder(/(What is|What's)?\s?([\d.]+) ÷ ([\d.]+)/i, function(){
    var a = parseFloat(RegExp.$2);
    var b = parseFloat(RegExp.$3);
    var r = a / b;
    var response = (number(a)+` divided by `+number(b)+` is`+ number(r))
    Asher.respond(response);
  })

  // modulus
  // what is the modulus of 20 divided by 6
  Asher.addResponder(/(What is|What's)? the modulus of ([\d.]+) ÷ ([\d.]+)/i, function(){
    var a = parseFloat(RegExp.$2);
    var b = parseFloat(RegExp.$3);
    var r = a % b;
    var response = (`The modulus of `+number(a)+` divided by `+number(b)+` is`+ number(r))
    Asher.respond(response);
  })

  // percentage
  // what is 10.5% of 340.5
  Asher.addResponder(/(What is|What's)?\s?([\d.]+)% of ([\d.]+)/i, function(){
    var a = parseFloat(RegExp.$2);
    var b = parseFloat(RegExp.$3);
    var p = (a / 100) * b;
    Asher.respond(number(a)+`% of `+number(b)+` is`+ number(p));
  })

  // function to format a number for speach
  function number(number){
    return number.toString().replace(/\./g, ` point `)
  }
});

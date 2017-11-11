Core = ( function() {

  var fs = require('fs');
  var builtinPhrases = require('../builtins');
  var Brain = require('./brain')

  var Asher = {
    Brain: new Brain()
  }

  AsherTrain = ( function(){
    Asher.Teach = Asher.Brain.teach.bind(Asher.Brain);
    eachKey(builtinPhrases, Asher.Teach);
    Asher.Brain.think();
    console.log('Asher has finished learning, time to listen...');
  })

  AsherHear = ( function(msg) {
    var interpretation = Asher.Brain.interpret(msg);
    console.log('Asher heard: ' + msg);
    console.log('Asher interpretation: ', interpretation);
    if (interpretation.guess){
      console.log('Invoking skill: ' + interpretation.guess);
      Asher.Brain.invoke(interpretation.guess, interpretation, msg);
    } else {
      // This is where we need to respond with a message saying "oh no... idk what to do."
      fs.appendFile('phrase-errors.txt', msg, function (err) {
        console.log('\n\tBrain Err: Appending phrase for review\n\t\t' + msg)
      })
    }
  })

  function eachKey(object, callback) {
    Object.keys(object).forEach(function(key) {
      callback(key, object[key]);
    })
  }
});

module.exports = Core;

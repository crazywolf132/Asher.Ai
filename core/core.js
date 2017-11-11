Core = ( function() {

  var fs = require('fs');
  var builtinPhrases = require('../builtins');

  var Asher = {
    Brain = new Brain()
  }

  AsherTrain = ( function(){
    Asher.Teach = Asher.Brain.teach.bind(Asher.Brain);
    eachKey(builtinPhrases, Asher.Teach);
    Asher.Brain.think();
    console.log('Asher has finished learning, time to listen...');
  })

  function eachKey(object, callback) {
    Object.keys(object).forEach(function(key) {
      callback(key, object[key]);
    })
  }
});

module.exports = Core;

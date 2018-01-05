module.exports = ((subject, message, socket) => {
    let msg = nlp(message).match('#Value .').out('text');
    let holder = msg.split(' ');
    console.log(holder);
    let time = holder[1];
    let unit = holder[2];
    setTimer(time, unit, () => {
        socket.emit('result', "timer is going off now!");
    });
    return ("timer is set");
});

function unitMultiplier(unit) {
    if (unit === 'hour' || unit === 'hours') {
        return (60 * 60)
    } else if (unit === 'minute' || unit === 'minutes') {
        return 60
    } else if (unit === 'second' || unit === 'seconds') {
        return 1
    }
}

function setTimer(quantity, unit, callback) {
    var Timer = require('timer.js');
    if (quantity && unit) {
        const duration = quantity * unitMultiplier(unit);
        const timer = new Timer();
        timer.start(duration).on('end', function () {
            callback.call();
        });
    }
}






/*
var Timer = require('timer.js')

function unitMultiplier(unit){
  if ( /hour/i.test(unit) ){
    return (60 * 60)
  }else if ( /minute/i.test(unit) ){
    return 60
  }else{
    return 1
  }
}

function setTimer(quantity, unit, callback){
  if ( quantity && unit ){
    var duration = quantity * unitMultiplier(unit)

    var timer = new Timer();
    timer.start(duration).on('end', function () {
      callback.call()
    });
  }
}

// basic timer
// Set a timer for 20 seconds
voiceBox.addResponder(/timer for (\d+) (seconds|hours?|minutes?)/i, function(){
  var quantity = RegExp.$1
  var unit = RegExp.$2
  setTimer(quantity, unit, function(){
    voiceBox.respond('Your timer has finished')
  })
  voiceBox.respond('I have started a timer for '+quantity+' '+unit+'')
})

// Remind me to take the pizza out of the oven in 15 minutes
voiceBox.addResponder(/Remind me to (.+) in (\d+) (seconds|hours?|minutes?)/i, function(){
  // replace any my's with your's
  var message = RegExp.$1.replace('my', 'your')
  var quantity = RegExp.$2
  var unit = RegExp.$3
  setTimer(quantity, unit, function(){
    var name = voiceBox.db.get('users_name')
    if ( name ){
      voiceBox.respond('Hey '+name+', remember to '+message);
    }else{
      voiceBox.respond('Remember to '+message);
    }
  })
  voiceBox.respond('Ok, I\'l remind you to '+message+' in '+quantity+' '+unit+'')
})
*/

module.exports=(
  function(subject, message) {
    input = message.split(' ');
    let query = input[-1];
    var request = require('request');
    var msg = ""
    request.post('http://api.duckduckgo.com/?q=Where+is+'+query+'&format=json&pretty=1', { json: { command: _message } }, (err, resp, body) => {
        //do stuff
        if (!err && resp.statusCode == 200) {
            console.log(body)
            //{ status: 'success', reply: 92 }
            if ( body.Abstract ){
              msg = body.Abstract;
            }else{
              msg = "I'm sorry I couldn't find any information about " + query
            }
        }
    })
  }
)

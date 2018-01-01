module.exports=(
  function(subject, message) {
    input = message.split(' ');
    let query = input[input.length - 1];
    console.log(input)
    console.log("Query is: " + query)
    var request = require('request');
    var msg = ""
    request.post('http://api.duckduckgo.com/?q=Where+is+'+query+'&format=json&pretty=1', (err, resp, body) => {
        //do stuff
        if (!err && resp.statusCode == 200) {
            var body = JSON.parse(body);
            //{ status: 'success', reply: 92 }
            if ( body.Abstract ){
              msg = body.Abstract;
            }else{
              msg = "I'm sorry I couldn't find any information about " + query
            }
        }
    })
    return msg
  }
)

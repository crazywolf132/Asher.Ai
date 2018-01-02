module.exports=(
  async function(subject, message) {
    input = message.split(' ');
    var query = input[input.length - 1];
    return await ask(query)
  }


)
function ask(query){
  var request = require('request');
  return new Promise(resolve => {
        request.get('http://api.duckduckgo.com/?q=Where+is+'+query+'&format=json&pretty=1', (err, resp, body) => {
            if (!err && resp.statusCode == 200) {
                var body = JSON.parse(body);
                if ( body.Abstract ){
                  var response = body.Abstract;
                  resolve(response.substring(0, response.indexOf('.') + 1))
                }else{
                  resolve("I'm sorry I couldn't find any information about " + query);
                }
            }
        })
    })
}

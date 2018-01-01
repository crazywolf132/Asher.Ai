module.exports=(
  function(subject, message) {
    input = message.split(' ');
    let query = input[input.length - 1];
    console.log(input)
    console.log("Query is: " + query)
    const msg = await ask(query)
    return msg
    //return ask(query)
  }


)
function ask(query){
  return new Promise(resolve => {
        request.post('http://api.duckduckgo.com/?q=Where+is+'+query+'&format=json&pretty=1', (err, resp, body) => {
            //do stuff
            if (!err && resp.statusCode == 200) {
                console.log(body)
                var body = JSON.parse(body);
                //{ status: 'success', reply: 92 }
                if ( body.Abstract ){
                  resolve(body.Abstract);
                }else{
                  resolve("I'm sorry I couldn't find any information about " + query);
                }
            }
        })
    })
}

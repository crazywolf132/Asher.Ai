module.exports = async (subject, message, socket, core, continuation) => {
  const responses = ["Not as far as im aware",
   "Not unless someone married me without my concent...",
   "Not at the moment. I currently have other things on my plate..."
  ];

  if (message.indexOf('we') > -1) {
    // We are going to respond with a "we" or "us", as they asked about us...
    let resp = responses[Math.floor(Math.random()*responses.length)];
    if (resp.indexOf('someone') > -1){
      // We are just going to have to swap 'someone' with 'you';
      resp = resp.replace('someone', 'you');
      resp = resp.replace('concent', 'knowledge');
    }
    return resp
  } else {
    // We did not find a "we" in the message, so we are just going to assume
    // that it is only about us, and wasnt about us and the user...
    return responses[Math.floor(Math.random()*responses.length)];
  }
}

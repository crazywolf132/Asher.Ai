module.exports = (
  async (subject, message, socket) => {
   const remember = require('../../../server').remember
   const forget = require('../../../server').forget
   console.log(message)
   const responses = ['hello', 'hey', "G'day", 'hi', 'howdy', 'aloha'];
   const question = ', how are you?'
   if (Math.floor((Math.random() * 2) + 1) === 2){
   //if (2 === 2) {
     remember(socket.id, 'casual/hru')
     return (responses[Math.floor(Math.random() * responses.length - 1)] + question)
   } else {
     forget(socket.id)
     return (responses[Math.floor(Math.random() * responses.length - 1)]);
   }
  }
);

module.exports = (
  async (subject, message, socket, core) => {
   const responses = ['hello', 'hey', "G'day", 'hi', 'howdy', 'aloha'];
   const question = ', how are you?'
   if (Math.random() === 1){
   //if (2 === 2) {
     core.remember(socket.id, 'casual/hru')
     return (responses[Math.floor(Math.random() * responses.length - 1)] + question)
   } else {
     core.forget(socket.id)
     return (responses[Math.floor(Math.random() * responses.length - 1)]);
   }
  }
);

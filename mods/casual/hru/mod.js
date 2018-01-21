module.exports = (
  async (subject, message, socket, core, continuation) => {
   const responses = ['hello', 'hey', "G'day", 'hi', 'howdy', 'aloha'];
   const good_replys = ['i am (good|great|excelent|ok) .?', "I'm (good|great|excelent|ok) .?"]
   const bad_replys = ['i am not .? (good|great|excelent|ok) .?', "I'm not .? (good|great|excelent|ok) .?"]
   const question = ', how are you?'
   const second_responses_good = ['Thats good to hear', 'Thats what i like to hear', 'Thats Great!']
   const second_responses_bad = ['Thats not good!', 'Oh no, thats not what i was wanting to hear.']
   if (continuation){
     good_replys.forEach(function(item) {
       if (nlp(message).match(item).found){
         num = Math.floor(Math.random()*second_responses_good.length);
         return (second_responses_good[num]);
       }
     })
     bad_replys.forEach(function(item) {
       if (nlp(message).match(item).found){
         return (second_responses_bad[Math.floor(Math.random()*second_responses_bad.length)]);
       }
     })
   }else{
     if (Math.random() === 1){
       core.remember(socket.id, 'casual/hru')
       return (responses[Math.floor(Math.random()*responses.length)] + question)
     } else {
       core.forget(socket.id)
       return (responses[Math.floor(Math.random()*responses.length)]);
     }
   }
  }
);

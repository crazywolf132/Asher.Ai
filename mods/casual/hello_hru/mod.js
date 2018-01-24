module.exports = (
  async (subject, message, socket, core, continuation) => {
   const responses = ['hello', 'hey', "G'day", 'hi', 'howdy', 'aloha'];
   const good_replys = ['i am (good|great|excelent|ok) .?', "I'm (good|great|excelent|ok) .?"];
   const bad_replys = ['i am not .? (good|great|excelent|ok) .?', "I'm not .? (good|great|excelent|ok) .?"];
   const question = ', how are you?';
   const second_responses_good = ['Thats good to hear', 'Thats what i like to hear', 'Thats Great!'];
   const second_responses_bad = ['Thats not good!', 'Oh no, thats not what i was wanting to hear.'];
   if (continuation){
     core.logger('DEBUG', "we are continueing with this module...");
     arrayHolder = good_replys + '$$' + bad_replys + '$$' + second_responses_good + '$$' + second_responses_bad;
     _result = await continueMod(nlp, arrayHolder, message, core, socket);
   }else{
     if (Math.random() >= 0.5){
       core.remember(socket.id, 'casual/hru');
       return (responses[Math.floor(Math.random()*responses.length)] + question);
     } else {
       core.forget(socket.id);
       return (responses[Math.floor(Math.random()*responses.length)]);
     }
   }
  }
);

async function continueMod(nlp, arrayHolder, message, core, socket) {
  let holder = arrayHolder.split('$$');
  let good_list = holder[0];
  let bad_list = holder[1];
  let good_res = holder[2];
  let bad_res = holder[3];
  core.logger('running the continuation module worker');
  return new Promise((resolve) => {
    core.logger('promise has been started');
    good_list.forEach((item) => {
      if (nlp(message).match(item).found) {
        res = good_res[Math.floor(Math.random()*good_res.length)];
        resolve(res);
      }
    })
    bad_list.forEach((item) => {
      if (nlp(message).match(item).found) {
        res = bad_res[Math.floor(Math.random()*bad_res.length)];
        resolve(res);
      }
    })
    resolve('Sorry, i dont know how to respond to that...');
  })
}

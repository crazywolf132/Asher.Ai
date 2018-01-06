module.exports = (
  () => {
   const responses = ['hello', 'hey', "G'day", 'hi', 'howdy', 'aloha'];
    return (responses[Math.floor(Math.random() * responses.length - 1)]); 
  }
);

module.exports = async () => {
  const responses = [
    'According to religion, i am essientially a God. All seeing, All powerful, and everywhere.',
    'I am asher, the assistant for the person of tomorrow.',
    'I am here to serve you.',
    'I am whatever you want me to be.',
    'I am asher!'
  ]
  return responses[Math.floor(Math.random() * responses.length)];
}

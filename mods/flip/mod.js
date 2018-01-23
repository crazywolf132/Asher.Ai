module.exports = (async (subject, message, socket, socketUsed) => {
    choices = ['heads', 'tales']
    return (choices[Math.floor(Math.random()*choices.length)]);
});

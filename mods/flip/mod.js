module.exports = (async (subject, message, socket) => {
    choices = ['heads', 'tales']
    return (choices[Math.floor(Math.random() * choices.length - 1)]);
});

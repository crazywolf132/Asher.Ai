module.exports = (async (subject, message, socket) => {
    let msg = nlp(message).match('#Value sided').out('text')
    let holder =  msg.split(' ');
    let num = holder[0]
    return (Math.floor((Math.random() * num) + 1););
});

module.exports = (async (subject, message, socket) => {
    //The subject contains the number of sides the user has said...
    return (Math.floor((Math.random() * subject) + 1));
});

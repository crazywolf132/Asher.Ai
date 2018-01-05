module.exports = (function (subject, message, socket) {
    const input = message.split(' ');
    const query = input[input.length - 1];
    return await ask(query)
});
async function ask(query) {
    const request = require('request');
    return new Promise((resolve) => {
        request.get('http://api.duckduckgo.com/?q=Where+is+' + query + '&format=json&pretty=1', (err, resp, body) => {
            if (!err && resp.statusCode == 200) {
                const body = JSON.parse(body);
                if (body.Abstract) {
                    const response = body.Abstract;
                    resolve(response.substring(0, response.indexOf('.') + 1))
                } else {
                    resolve("I'm sorry I couldn't find any information about " + query);
                }
            }
        });
    });
};

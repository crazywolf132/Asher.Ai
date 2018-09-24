const data = require(process.cwd() + `/config/config`);
const fetch = require("node-fetch");

class FbResponder {
    constructor(core, recipient, mess) {
        this.core = core;
        this.sender = recipient;
        this.message = mess;
        this.accessToken = data.accessToken;
        this.say(this.sender, this.message);
    }

    say(recipientID, message) {
        if (typeof message === "string") {
            return this.sendTextMessage(recipientID, message);
        }
    }

    sendTextMessage(recipientID, text) {
        const message = { text };
        const recipient = this._createRecipient(recipientID);
        const reqBody = {
            recipient,
            message,
            messaging_type: "RESPONSE",
        };

        const req = () => {
            this.sendRequest(reqBody).then((json) => {
                return json;
            });
        }
        return req();
    }

    _createRecipient(recipient) {
        return typeof recipient === "object" ? recipient : { id: recipient };
    }

    sendRequest(body, endpoint, method) {
        endpoint = endpoint || "messages";
        method = method || "POST";
        return fetch(
            `https://graph.facebook.com/v2.6/me/${endpoint}?access_token=${
            this.accessToken
            }`,
            {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            }
        )
            .then((res) => res.json())
            .then((res) => {
                return res;
            })
            .catch((err) => console.log(`Error sending message: ${err}`));
    }
}

module.exports = FbResponder;
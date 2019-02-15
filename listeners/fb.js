import express from "express";
import { json } from "body-parser";
const data = require(process.cwd() + `/config/config`);
import { createHmac } from "crypto";

class FbListener {
    constructor(core) {
        this.core = core;
        this.app = express();
        this.webhook = `/webhook`;
        this.app.use(json({ very: this._verifySignature.bind(this) }));
        this.started = false;
        this.verifyToken = data.verifyToken;
        this.appSecret = data.appSecret;
        if (!this.started) {
            this.started = true;
            this.start(80);
        }
    }

    start(port) {
        this._startWebhook();
        this.app.set("port", port || 80);
        this.server = this.app.listen(this.app.get("port"), () => {
            const portNum = this.app.get("port");
            console.log(`Core running on port: ${portNum}`);
        });
    }

    close() {
        this.server.close();
    }

    _startWebhook() {
        this.app.get(this.webhook, (req, res) => {
            if (req.query["hub.mode"] === "subscribe" && req.query["hub.verify_token"] === this.verifyToken) {
                console.log("Validation Succeded.");
                res.status(200).send(req.query["hub.challenge"]);
            } else {
                console.error(
                    "Failed validation. Make sure the validation tokens match."
                );
                res.sendStatus(200);
            }
        });

        this.app.post(this.webhook, (req, res) => {
            var data = req.body;
            if (data.object !== "page") {
                return;
            }
            this.handleData(data);

            res.sendStatus(200);
        })
    }

    handleData(data) {
        data.entry.forEach((entry) => {
            if (entry.messaging) {
                entry.messaging.forEach((event) => {
                    if (event.message && event.message.text) {
                        this.handleMessage(event);
                    }
                });
            }
        });
    }

    handleMessage(event) {
        
        this.core.getMessage(event.message.text, event.sender.id);
    }

    _verifySignature(req, res, buf) {
        var signature = req.headers["x-hub-signature"];
        if (!signature) {
            throw new Error("Couldnt validate the request signature");
        } else {
            var elements = signature.split("=");
            var method = elements[0];
            var signatureHash = elements[1];
            var expectedHash = createHmac("sha1", this.appSecret).update(buf).digest("hex");
            
            if (signatureHash != expectedHash) {
                throw new Error("Couldn't validate the request signature.");
            }
        }
    }

}

export default FbListener;
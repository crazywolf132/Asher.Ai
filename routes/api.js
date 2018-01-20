var express = require(`express`);
var router = express.Router();

router.route(`/talk`).post(function (req, res) {
    console.log(`Incomming...`);
    let command = req.body.command || null;
    if (command === null) {
        return (res.json({
            status: `fail`,
            error: `No command provided!`
        }));
    }
    console.log(`receiving \`${command}\``);
    Promise.resolve(workItOut(command, false)).then((response) => {
        console.log(`responded with \`${response}\``);
        if (response !== `undefined`) {
            res.json({
                status: `success`,
                reply: response
            });
        } else {
            res.json({
                status: `unknown`
            })
        }
    });


});

module.exports = router;

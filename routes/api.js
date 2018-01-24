var express = require(`express`);
var router = express.Router();
var logger = require(`${process.cwd()}/server`).logger;

router.route(`/talk`).post(function(req, res) {
	logger("Normal", `Incomming...`);
	let command = req.body.command || null;
	if (command === null) {
		return res.json({
			status: `fail`,
			error: `No command provided!`
		});
	}
	logger("Normal", `receiving \`${command}\``);
	Promise.resolve(workItOut(command, false)).then(response => {
		logger("Normal", `responded with \`${response}\``);
		if (response !== `undefined`) {
			res.json({
				status: `success`,
				reply: response
			});
		} else {
			res.json({
				status: `unknown`
			});
		}
	});
});

module.exports = router;

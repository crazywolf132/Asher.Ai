import { Router } from "express";
var router = Router();
import {
	workOut
} from "../build/Release/brain";

// We are only going to work with the brain, none of the modules.

router.route("/talk").post(function(req, res) {
	let command = req.body.command || null;
	if (command === null) {
		console.log(req.body);
		return res.json({
			status: "fail",
			error: "No command provided!",
		});
	}

	let response = workOut(command);
	if (response == '-1') {
		res.json({
			status: "fail",
			error: "I am sorry, but i dont know how to respond to that yet!"
		});
	} else {
		res.json({
			status: "success",
			reply: response
		})
	}

	// Promise.resolve(workOut(command, false)).then((response) => {
	// 	if (response !== "undefined") {
	// 		res.json({
	// 			status: "success",
	// 			reply: response,
	// 		});
	// 	} else {
	// 		res.json({
	// 			status: "unknown",
	// 		});
	// 	}
	// });
});

export default router;

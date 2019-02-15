import { Router } from "express";
var router = Router();

router.route("/").get(function(req, res, next) {
	res.render("latest");
});

router.route("/old").get((req, res, next) => {
	res.render("home");
});

export default router;

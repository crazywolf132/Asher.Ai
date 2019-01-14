var express = require("express");
var router = express.Router();

router.route("/").get(function(req, res, next) {
	res.render("latest");
});

router.route("/old").get((req, res, next) => {
	res.render("home");
});

module.exports = router;

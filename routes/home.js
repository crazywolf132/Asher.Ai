var express = require("express");
var router = express.Router();

router.route("/").get(function(req, res, next) {
	res.render("home");
});

router.route("/chat").get((req, res, next) => {
	res.render("chat");
});

router.route("/test").get((req, res, next) => {
	res.render("test");
});

module.exports = router;

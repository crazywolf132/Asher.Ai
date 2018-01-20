var express = require(`express`);
var router = express.Router();

router.route(`/login`)
    .post((req, res) => {
        const user = req.body.username || false;
        if (user === false) {
            return (res.status(401).send({
                status: `fail`,
                error: `No user provided!`
            }));
        }
        getUser(user, (exist, user) => {
            if (!exist) {
                return (res.status(401).send({
                    status: `fail`,
                    error: `User doesn\`t exist!`
                }));
            }
            const password = req.body.password || false;
            if (password === false) {
                return (res.status(401).send({
                    status: `fail `,
                    error: `No password supplied!`
                }));
            }
            user.comparePassword(password, (err, isMatch) => {
                if (isMatch && !err) {
                    const token = newToken();
                    return (res.json({
                        status: `success`,
                        message: `Login success!`,
                        token: token
                    }));
                }
            });
        });
    });

router.route(`/signup`).post((req, res) => {
    if (!req.body.username || !req.body.password) {
        res.json({
            status: `fail`,
            error: `Please supply username and / or password!`
        });
    } else {
        var newUser = new User({
            username: req.body.username,
            password: req.body.password
        });
        newUser.save((err) => {
            if (err) {
                return (res.json({
                    status: `fail`,
                    error: `Username already exists.`
                }));
            }
            res.json({
                status: `success`,
                message: `Successfully created new user.`
            });
        });
    }
});


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
    //let response = workItOut(command);
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

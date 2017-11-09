var Asher=require(`./core/asher.js`)();
require(`./core/asherCommands.js`)(Asher);

// mods
require(`./mods/math.js`)(Asher);
require(`./mods/internet_query.js`)(Asher);
require(`./mods/natural-language.js`)(Asher);

require(`./mods/core.js`)(Asher);

var express=require(`express`);
var app=express();

var morgan=require(`morgan`);
var bodyParser=require(`body-parser`);

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config/database');

mongoose.connect(config.database);

app.use(morgan(`dev`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(passport.initialize());

var port=process.env.PORT||80;

var api_router=express.Router();

api_router.use(function(req, res, next) {
	console.log(`Something is happening.`);
	next();
});

api_router.route(`/talk/:command`)
    .post(function(req,res){
        var command=req.params.command;
        console.log("receiving "+command);
        var args=[];
        for(var i=0;i<10;i++){
            if(req.body[`arg`+i]!==undefined){
                args.push(req.body[`arg`+i]);
            }
        }
        res.json(Asher.processCommand(command,args));
    });

app.use(`/api`,api_router);

app.listen(port);
console.log(`Magic happens on port ${port}`);

var express       = require(`express`);
var app           = express();
var morgan        = require(`morgan`);
var bodyParser    = require(`body-parser`);
var mongoose      = require(`mongoose`);

var config        = require(`./config/database`);
var User          = require(`./models/user`);
var fs = require('fs');

var Asher         = require(`./core/asher`)();
require(`./core/asherCommands`)(Asher);
// mods
require(`./mods/math`)(Asher);
require(`./mods/internet_query`)(Asher);
require(`./mods/natural-language`)(Asher);
require(`./mods/core`)(Asher);

var speak = require('speakeasy-nlp')
var swears = []
////////////////////////////////////////////////////////////////////////////////
//                              Setting up app                                //
////////////////////////////////////////////////////////////////////////////////
mongoose.connect(config.database);

app.use(morgan(`dev`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(function(req,res,next){
    res.header(`Access-Control-Allow-Origin`,`*`);
    res.header(`Access-Control-Allow-Headers`,`Origin, X-Requested-With, Content-Type, Accept`);
    next();
});

var port=process.env.PORT||80;

var api_router=express.Router();

////////////////////////////////////////////////////////////////////////////////
//                              All our functions                             //
////////////////////////////////////////////////////////////////////////////////

newToken=(function(){
    var generated={};
    var generate=(function(){
        var octets=[];
        for(var i=0;i<32;i++){
            var octet=Math.round(Math.random()*255).toString(16)+"";
            if(octet.length==1){octet="0"+octet;}
            octets.push(octet);
        }
        return octets.join("-").toUpperCase();
    });
    var output=(function(){
        var new_token=generate();
        while(generated[new_token]!==undefined){
            new_token=generate();
        }
        generated[new_token]=true;
        return new_token;
    });
    return output;
})();

getUser=(function(user,cb=(()=>{})){
    User.findOne({
        username:user
    },function(err,user){
        if(err){return cb(false,null);}
        if(!user){return cb(false,null);}
        return cb(true,user);
    });
});

let test1 = "what is the time";
let test2 = "what is the date";
let test3 = "what time is it";

workItOut = function(msg){

  console.log(speak.closest(msg, [test1, test2, test3]));
}

makeSame = function(list1, list2){
  console.log('running')
  list1 = list2
}

fileToArray = function(file, list){
  var fs = require('fs');
  var array = fs.readFileSync(file).toString().split("\n");
  for(i in array) {
      list.push(array[i]);
  }
}

////////////////////////////////////////////////////////////////////////////////
//                              Setting up routes                             //
////////////////////////////////////////////////////////////////////////////////
fileToArray('swears.txt', swears)
console.log(swears)

api_router.use(function(req,res,next){
    console.log(`Something is happening.`);
    next();
});

api_router.route(`/login`)
.post(function(req,res){
    var user=req.body.username||false;
    if(user===false){
        return res.status(401).send({
            status:`fail`,
            error:`No user provided!`
        });
    }
    getUser(user,function(exist,user){
        if(!exist){
            return res.status(401).send({
                status:`fail`,
                error:`User doesn't exist!`
            });
        }
        var password=req.body.password||false;
        if(password===false){
            return res.status(401).send({
                status:`fail`,
                error:`No password supplied!`
            });
        }
        user.comparePassword(password,function(err,isMatch){
            if(isMatch&&!err){
                var token=newToken();
                return res.json({
                    status:`success`,
                    message:`Login success!`,
                    token:token
                });
            }
        });
    });
});

api_router.route(`/signup`)
.post(function(req,res){
    if(!req.body.username||!req.body.password){
        res.json({
            status:`fail`,
            error:`Please supply username and/or password!`
        });
    }else{
        var newUser=new User({
            username:req.body.username,
            password:req.body.password
        });
        newUser.save(function(err){
            if(err){
                return res.json({
                    status:`fail`,
                    error:`Username already exists.`
                });
            }
            res.json({
                status:`success`,
                message:`Successfully created new user.`
            });
        });
    }
});


api_router.route(`/talk/:command`)
.post(function(req,res){
      var command=req.params.command||null;
      if(command===null){
          return res.json({
              status:`fail`,
              error:`No command provided!`
          });
      }
      console.log(`receiving ${command}`);
      workItOut(command);
      let sub = speak.classify(command)
      let feeling = speak.sentiment.analyze(command);
      console.log(`# ${sub.subject}`);
      console.log(feeling)
});

app.use(`/api`,api_router);

////////////////////////////////////////////////////////////////////////////////
//                              Setting up listener                           //
////////////////////////////////////////////////////////////////////////////////
app.listen(port);
console.log(`Magic happens on port ${port}`);

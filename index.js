var Asher=require(`./core/asher`)();
require(`./core/asherCommands`)(Asher);

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

// mods
require(`./mods/math`)(Asher);
require(`./mods/internet_query`)(Asher);
require(`./mods/natural-language`)(Asher);
require(`./mods/core`)(Asher);

var express=require(`express`);
var app=express();

var morgan=require(`morgan`);
var bodyParser=require(`body-parser`);

var mongoose=require(`mongoose`);
var config=require(`./config/database`);

mongoose.connect(config.database);

app.use(morgan(`dev`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(function(req,res,next){
    res.header(`Access-Control-Allow-Origin`,`*`);
    res.header(`Access-Control-Allow-Headers`,`Origin, X-Requested-With, Content-Type, Accept`);
    next();
});

getUser=(function(user,cb=(()=>{})){
    User.findOne({
        username:user
    },function(err,user){
        if(err){cb(false,null);}
        cb(true,user);
    });
});

var port=process.env.PORT||80;

var api_router=express.Router();
var User=require(`./models/user`);

api_router.use(function(req,res,next){
    console.log(`Something is happening.`);
    next();
});

api_router.route(`/login`)
.post(function(req,res){
    var user=req.body.user||false;
    if(user===false){
        return res.status(401).send({
            status:`fail`,
            error:`No user provided!`
        });
    }
    getUser(user,function(exist,user){
        if(!exist){
            res.status(401).send({
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
    var token=req.body.token||null;
    if(token!==null){
      var command=req.params.command||null;
      if(command===null){
          return res.json({
              status:`fail`,
              error:`No command provided!`
          });
      }
      console.log(`receiving ${command}`);
      var args=[];
      for(var i=0;i<10;i++){
          if(req.body[`arg${i}`]!==undefined){
              args.push(req.body[`arg${i}`]);
          }
      }
      res.json(Asher.processCommand(command,args));
    }else{
      res.json({
        status:`fail`,
        error:`No token provided!`
      });
    }
});

app.use(`/api`,api_router);

app.listen(port);
console.log(`Magic happens on port ${port}`);
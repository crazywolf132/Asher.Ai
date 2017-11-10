var Asher=require(`./core/asher`)();
require(`./core/asherCommands`)(Asher);

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
var passport=require(`passport`);
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
app.use(passport.initialize());

var port=process.env.PORT||80;

var api_router=express.Router();
var User=require(`./models/user`);
var jwt=require(`jsonwebtoken`);
require(`./config/passport`)(passport);

api_router.use(function(req,res,next){
    console.log(`Something is happening.`);
    next();
});

getToken=(function(headers){
    if(headers&&headers.authorization){
        var parted=headers.authorization.split(' ');
        if(parted.length===2){
            return parted[1];
        }else{
            return null;
        }
    }else{
        return null;
    }
});

api_router.route(`/login`)
.post(function(req,res){
    User.findOne({
        username:req.body.username
    },function(err,user){
        if(err){throw err;}
        if(!user){
            res.status(401).send({
                success:false,
                msg:`Authentication failed.`
            });
        }else{
            // check if the password matches
            user.comparePassword(req.body.password,function(err,isMatch){
                if(isMatch&&!err){
                    // if user is found and password is right, create a token
                    const token=jwt.sign(user.toJSON(),config.secret);
                    // return the information including token as JSON
                    res.json({
                        success:true,
                        token:`JWT ${token}`
                    });
                }else{
                    res.status(401).send({
                        success:false,
                        msg:`Authentication failed.`
                    });
                }
            });
        }
    });
});

api_router.route(`/signup`)
.post(function(req,res){
    if(!req.body.username||!req.body.password){
        res+.json({
            success:false,
            msg:`Please supply a username and password`
        });
    }else{
        var newUser=new User({
            username:req.body.username,
            password:req.body.password
        });
        // save the username
        newUser.save(function(err) {
            if(err){
                return res.json({
                    success:false,
                    msg:`Username already exists.`
                });
            }
            res.json({
                success:true,
                msg:`Successfully created new user.`
            });
        });
    }
});


api_router.route(`/talk/:command`)
.post(passport.authenticate(`jwt`,{session:false}),function(req,res){
    var token=getToken(req.headers);
    if(token){
      v+ar command=req.params.command;
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
        success:false,
        msg:'Please provide token'
      });
    }
});

app.use(`/api`,api_router);

app.listen(port);
console.log(`Magic happens on port ${port}`);
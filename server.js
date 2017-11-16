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
var NLP = require('natural');
var fs = require('fs');
var sentiment = require('sentiment');
var builtinPhrases = require('./builtins');
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

workItOut = function(msg){
  // This is just here for testing purposes...
  //console.log(speak.closest(msg, [test1, test2, test3]));
  let correct = speak.closest(msg, commands);
  let res = speak.classify(correct).subject;

  let guess = speak.classify(msg).subject;
  if (res == guess){
    console.log('We are definetly talking about: ' + res)
  }
  //console.log("We are talking about: " + res.subject)
}

eachThing = function(list, called){
  Object.keys(list).forEach(function(key) {
    teach(key, called)
  })
}
eachKey = function(object, place_to_send) {
  Object.keys(object).forEach(function(key) {
    teach(key, object[key]);
  });
}

let minConfidence = 0.7
var classifier = new NLP.LogisticRegressionClassifier();
function toMaxValue(x, y) {
  return x && x.value > y.value ? x : y;
}
teach = function(theFile, label) {
  var fs = require('fs');
  var array = fs.readFileSync(theFile).toString().split("\n");
  for(i in array) {
    console.log('Ingesting example for ' + label + ': ' + array[i]);
    classifier.addDocument(array[i], label);
  }
}
think = function() {
  classifier.train();

  // save the classifier for later use
  var aPath = './core/classifier.json';
  classifier.save(aPath, function(err, classifier) {
    if (err){
      console.log("WE HIT AN ERROR: " + err)
    }
    // the classifier is saved to the classifier.json file!
    console.log('Writing: Creating a Classifier file in SRC.');
  });
};
interpret = function(phrase) {
  var guesses = classifier.getClassifications(phrase);

  var guess = guesses.reduce(toMaxValue);
  console.log("###")
  console.log(guess.value)
  console.log("###")
  return {
    probabilities: guesses,
    guess: guess.value > minConfidence ? guess.label : null
  };
};

fileToArray = function(file, list){
  var fs = require('fs');
  var array = fs.readFileSync(file).toString().split("\n");
  for(i in array) {
      list.push(array[i]);
  }
}

findFilesAndFolders = function(_path, _list, returnNamesOnly, checkForDir, checkForFile){
  fs.readdirSync(_path).forEach(file => {
    if (checkForDir && !checkForFile){
      if (fs.statSync(_path + file).isDirectory()) {
        if (returnNamesOnly){
          _list.push(file)
        }else{
          _list.push(_path + file)
        }
      }
    }else if (!checkForDir && checkForFile) {
      if (fs.statSync(_path + file).isFile()) {
        _list.push(_path + file)
      }
    }else{
      if (returnNamesOnly){
        _list.push(file)
      }else{
        _list.push(_path + file)
      }
    }
  })
}

////////////////////////////////////////////////////////////////////////////////
//                              Setting up mods                               //
////////////////////////////////////////////////////////////////////////////////
fileToArray('swears.txt', swears)
let jokes = []
let commands = []
let mods = []

findFilesAndFolders('./mods/', mods, true, true, false)
mods.forEach(function(item){
  let holder = [];
  findFilesAndFolders('./mods/' + item + '/', holder, false, false, true)
  holder.forEach(function(file){
    if (file == './mods/' + item + '/words.txt'){
      teach('./mods/' + item + '/words.txt', item)
    }
  })
})
console.log("Only found " + mods.length + " mods")
think();

////////////////////////////////////////////////////////////////////////////////
//                              Setting up routes                             //
////////////////////////////////////////////////////////////////////////////////

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
      //We want this...
      console.log(`# ${sub.subject}`);
      console.log(feeling.negative.words)
      console.log('\n\n\n\n\n\n\n\n\n\n\n')
      console.log(interpret(command))
      //console.log(classifier)
});

app.use(`/api`,api_router);

////////////////////////////////////////////////////////////////////////////////
//                              Setting up listener                           //
////////////////////////////////////////////////////////////////////////////////
app.listen(port);
console.log(`Magic happens on port ${port}`);

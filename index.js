// BASE SETUP
// =============================================================================
console.log(process.env.PORT || 80);
// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port     = process.env.PORT || 80; // set our port


// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next();
});

router.route('/talk/:command')

  .post(function(req, res){
		//This is just to try and manually add a module...
		Asher.addResponder(/^Hi|hello|hey/i, function(){
		  Asher.respond('Hello')
		})
		// Here we are grabbing the command from the URL.
    var command = req.params.command
		// This is where i try to process the command with the function down below..
    var returned = Asher.process(command)
		res.json( message: returned )
  })


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

var Configstore = require('configstore');
var AsherResponder = require('./core/AsherResponder');

// This is the function that should control all of the commands... but it doesnt
// seem to be working at all. I can't seem to get access to the sub-functions.


// below is the edit

Asher=(function(){

	var self={};

  self.choices = []

  self.responders = []

  self.listening = false

  self.last_response = ''

  self.waiting_for_response = false

  //self.request = require('request')

  self.db = new Configstore('Asher')

  self.process = function(msg){
    var input = msg
    var response

    // if waiting for a response
    if ( self.waiting_for_response ){

      // iterate through the given choices
      Array.prototype.forEach.call(self.choices, function(responder, i){
        if ( responder.regex.test(input) ){
          response = responder
        }
      });

      // if they chose an invalid choice then ask again
      if ( response == undefined ){
        self.choice(self.last_response)
        return
      } else {
        // otherwise reset the choices array and set waiting for response to false
        self.choices = []
        self.waiting_for_response = false
      }

    } else {
      // iterate through the possible responses
      Array.prototype.forEach.call(self.responders, function(responder, i){
        if ( responder.regex.test(input) ){
          response = responder
        }
      });
    }

    // if a responder was found then call its response function
    if ( response != undefined ){
      var data = response.response()
			return data
    }
  }

  self.addResponder = function(regex, response){
    self.responders.push(new AsherResponder(regex, response))
  }

  self.addChoice = function(regex, response){
    self.choices.push(new AsherResponder(regex, responser))
  }

  self.respond = function(message, callback){
    self.last_response = message
    console.log(message)
    /**
    * This is where we need to return the response...
    * so then whoever is requesting the api can recieve
    * the response... so then they can do what they want with it
    **/
		return message
  }

  self.choice = function(message){
    self.waiting_for_response = true
    self.respond(message, function(){
      /**
      * This is where we need to wait for the next input...
      **/
    })
  }
	return self;
})();
require("./mods/core.js")(Asher);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

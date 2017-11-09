// BASE SETUP
// =============================================================================
console.log(process.env.PORT || 8080);
// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');
//var Asher      = require('./core/asher');

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port     = process.env.PORT || 8080; // set our port


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
    Asher.process(command)
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

  this.choices = []

  this.responders = []

  this.listening = false

  this.last_response = ''

  this.waiting_for_response = false

  //this.request = require('request')

  this.db = new Configstore('Asher')

  this.process = function(msg){
    var input = msg
    var response

    // if waiting for a response
    if ( this.waiting_for_response ){

      // iterate through the given choices
      Array.prototype.forEach.call(this.choices, function(responder, i){
        if ( responder.regex.test(input) ){
          response = responder
        }
      });

      // if they chose an invalid choice then ask again
      if ( response == undefined ){
        this.choice(this.last_response)
        return
      } else {
        // otherwise reset the choices array and set waiting for response to false
        this.choices = []
        this.waiting_for_response = false
      }

    } else {
      // iterate through the possible responses
      Array.prototype.forEach.call(this.responders, function(responder, i){
        if ( responder.regex.test(input) ){
          response = responder
        }
      });
    }

    // if a responder was found then call its response function
    if ( response != undefined ){
      response.response()
    }
  }

  this.addResponder = function(regex, response){
    this.responders.push(new AsherResponder(regex, response))
  }

  this.addChoice = function(regex, response){
    this.choices.push(new AsherResponder(regex, responser))
  }

  this.respond = function(message, callback){
    this.last_response = message
    console.log(message)
    /**
    * This is where we need to return the response...
    * so then whoever is requesting the api can recieve
    * the response... so then they can do what they want with it
    **/
  }

  this.choice = function(message){
    this.waiting_for_response = true
    this.respond(message, function(){
      /**
      * This is where we need to wait for the next input...
      **/
    })
  }
});

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

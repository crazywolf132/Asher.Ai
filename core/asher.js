var Configstore = require('configstore');
var AsherResponder = require('./AsherResponder');

function Asher(){
  var self = this

  this.choices = []

  this.responders = []

  this.listening = false

  this.last_response = ''

  this.waiting_for_response = false

  this.request = require('request')

  this.db = new Configstore('Asher')

  this.process = function(msg){
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
      response.response()
    }
  }

  this.addResponder = function(regex, response){
    this.responders.push(new AsherResponder(regex, response))
  }

  this.addChoice = function(regex, response){
    this.choices.push(new AsherResponder(regex, response))
  }

  this.respond = function(message, callback){
    self.last_response = message
    console.log(message)
    /**
    * This is where we need to return the response...
    * so then whoever is requesting the api can recieve
    * the response... so then they can do what they want with it
    **/
  }

  this.choice = function(message){
    self.waiting_for_response = true
    self.respond(message, function(){
      /**
      * This is where we need to wait for the next input...
      **/
    })
  }
}

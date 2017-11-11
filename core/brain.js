"use strict";

var NLP = require('natural');
var fs = require('fs');
var sentiment = require('sentiment');

module.exports = Brain;

function Brain() {
  this.classifier = new NLP.LogisticRegressionClassifier();
  this.minConfidence = 0.7;
}

Brain.prototype.teach = function(label, phrases) {
  phrases.forEach(function(phrase) {
    console.log('Ingesting example for ' + label + ': ' + phrase);
    this.classifier.addDocument(phrase.toLowerCase(), label);
  }.bind(this));
  return this;
};

Brain.prototype.think = function() {
  this.classifier.train();

  var aPath = './config/classifier.json';
  this.classifier.save(aPath, function(err, classifier) {
    console.log('Writing: Creating a Classifier file in CONFIG.');
  });

  return this;
};

Brain.prototype.interpret = function(phrase) {
  var guesses = this.classifier.getClassifications(phrase.toLowerCase());
  var guess = guesses.reduce(toMaxValue);
  return {
    probabilities: guesses,
    guess: guess.value > this.minConfidence ? guess.label : null
  };
};

Brain.prototype.invoke = function(skill, info, bot, message) {
  var skillCode;

  let senti = sentiment(message.text);
  if (senti.score != 0) {
    console.log('\n\tSentiment value: ');
    console.dir(senti);
    console.log('\n');
  }

  console.log('Grabbing code for skill: ' + skill);

  try {
    skillCode = require('../mods/' + skill);
  } catch (err) {
    throw new Error('The invoked skill doesn\'t exist!');
  }
  console.log('Running skill code for ' + skill + '...');
  skillCode(skill, info, bot, message, senti);
  return this;
};

function toMaxValue(x, y) {
  return x && x.value > y.value ? x : y;
}

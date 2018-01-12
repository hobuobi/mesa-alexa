var alexa = require('alexa-app');
var app = new alexa.app('parrot');
var express = require('express');
var router = express.Router();
var request = require('request');


//template : a string with a '--' in it
//word : a normal word
function qTemplate(template){
  this.template  = template
  this.word = '';
  this.setWord = (word) => this.word = word
  this.toString = function() { return this.template.replace('--',this.word) };
}
const questions = {
  'PERSON' : [
    new qTemplate('When did you meet --?'),
    new qTemplate('What is your favorite thing about --?'),
    new qTemplate('Where is -- from?')
  ],
  'LOCATION' : [
    new qTemplate('When did you go to --?'),
    new qTemplate('How did you get there?'),
    new qTemplate('What is your favorite thing about --?')
  ],
}
function returnQuestion(entity){
  if(entity.type == 'PERSON' || entity.type == 'LOCATION')
  {
    questionSet = questions[entity.type];
    console.log(questionSet)
    temp = questionSet[Math.floor(Math.random()*questionSet.length)] // randomize later
    console.log(temp)
    temp.setWord(entity.name)
    return temp.toString();
  }
}
console.log(returnQuestion({ name: 'norway', type: 'LOCATION' }))
function analyzeEntities(text){
  entities = []
  url = 'https://language.googleapis.com/v1/documents:analyzeEntities?key='+process.env.GOOG_API_KEY
  body = {
      document: {
        "type": 'PLAIN_TEXT',
        "content": text,
      },
      encodingType: 'UTF8',
  };
  return new Promise(function(resolve, reject){
    request.post({url: url, body: JSON.stringify(body), contentType: 'application/json'},
      function (error, response, body) {
          //console.log(url)
          //console.log(response.statusCode)
          if (!error && response.statusCode == 200) {
              body = JSON.parse(body)
              result = body.entities
              result.forEach(entity => {
                  entities.push({
                    name: entity.name,
                    type: entity.type
                  })
              });
              resolve(entities)   
          }
      }
    );
  })
}
//analyzeEntities('The quick brown fox jumps over the lazy dog.').then((result) => console.log(result));

app.launch(function(req, res) {
  res.say('Welcome to Mesa.');
});

app.intent('RepeatIntent', {
    'slots': {
      'WORD': 'AMAZON.LITERAL'
    },
    'utterances': [
      '{hi|WORD}',
      '{this is|WORD}',
      '{my name is|WORD}',
      '{how far away is amsterdam from san francisco|WORD}',
    ]
  },
  function(req, res) {
    var value = req.slot('WORD'); // returns the whole phrase that was captured from the voice
    var entityString = ''
    return analyzeEntities(value).then((entities) => {
      console.log(entities);
      entity = entities[Math.floor(Math.random()*entities.length)]; // randomize later
      res.say(returnQuestion(entity));
    });
    
  }
);

module.exports = app;

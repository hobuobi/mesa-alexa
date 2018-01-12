// Imports the Google Cloud client library
const language = require('@google-cloud/language');
var express = require('express');
var router = express.Router();
var request = require('request');
const client = new language.LanguageServiceClient();
 
function entityID(text){
    var entityList = []
    const document = {
        content: text,
        type: 'PLAIN_TEXT',
    };
    // Detects the sentiment of the text
    client
    .analyzeEntities({document: document})
    .then(results => {
        const entities = results[0].entities;
    
        console.log('Entities:');
        entities.forEach(entity => {
            console.log(entity.name);
            entityList.push(entity.name)
        });
        return entityList;
    })
    .catch(err => {
        console.error('ERROR:', err);
    });
}

function entityIDtest(text){
    const document = {
        content: text,
        type: 'PLAIN_TEXT',
    };
    // Detects the sentiment of the text
    client
    .analyzeEntities({document: document})
    .then(results => {
        const entities = results[0].entities;
    
        console.log('Entities:');
        entities.forEach(entity => {
            console.log(entity.name);
            console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
            if (entity.metadata && entity.metadata.wikipedia_url) {
                console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}$`);
            }
        });
    })
    .catch(err => {
        console.error('ERROR:', err);
    });
}

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

    request.post({url: url, body: JSON.stringify(body), contentType: 'application/json'},
        function (error, response, body) {
            console.log(response.statusCode)
            if (!error && response.statusCode == 200) {
                body = JSON.parse(body)
                result = body.entities
                result.forEach(entity => {
                    entities.push(entity.name)
                });
                console.log(entities)
                return entities
            }
        }
    );
}
analyzeEntities('The quick brown fox jumps over the lazy dog.')

module.exports = analysis;


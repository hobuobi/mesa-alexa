var express = require('express');
var request = require('supertest');
var chai = require('chai');
var expect = chai.expect;

describe('Parrot', function() {
  var server;

  beforeEach(function() {
    var app = express();
    var parrot = require('../parrot');
    parrot.express({
      expressApp: app,
      router: express.Router(),
      debug: true,
      checkCert: false
    });
    server = app.listen(3000);
  });

  afterEach(function() {
    server.close();
  });

  it('responds to invalid data', function() {
    return request(server)
      .post('/parrot')
      .send({})
      .expect(200).then(function(response) {
        return expect(response.body).to.eql({
          version: '1.0',
          response: {
            directives: [],
            shouldEndSession: true,
            outputSpeech: {
              type: 'SSML',
              ssml: '<speak>Error: not a valid request</speak>'
            }
          },
          sessionAttributes: {}
        });
      });
  });

  it('responds to a launch event', function() {
    return request(server)
      .post('/parrot')
      .send({
        request: {
          type: 'LaunchRequest',
        }
      })
      .expect(200).then(function(response) {
        var ssml = response.body.response.outputSpeech.ssml;
        return expect(ssml).to.eql('<speak>Welcome to Mesa.</speak>');
      });
  });

  it('responds to a repeat event', function() {
    return request(server)
      .post('/parrot')
      .send({
        request: {
          type: 'IntentRequest',
          intent: {
            name: 'RepeatIntent',
            slots: {
              WORD: {
                name: "WORD",
                value: "I would love to see the Northern Lights in Norway at some point in my life."
              }
            }
          }
        }
      })
      .expect(200).then(function(response) {
        var ssml = response.body.response.outputSpeech.ssml;
        return expect(ssml).to.eql('<speak>You mentioned brown fox, lazy dog</speak>');
      });
  });
});

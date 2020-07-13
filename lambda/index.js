const Alexa = require('ask-sdk-core');
const APLAnalyzer = require('./apl/document');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'APL_ANALYZER',
        version: '1.0',
        document: APLAnalyzer({
          // enable the next line to host the apl analyzer document yourself.
          // source: 'https://sld.tld/apl-analyzer/document.json'
        }),
        datasources: {}
      })
      .withShouldEndSession(undefined)
      .getResponse();
  }
};

const MiscellaneousIntentHandler = {
  canHandle(handlerInput) {
    return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent'))
        || Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(LaunchRequestHandler, MiscellaneousIntentHandler)
  .withCustomUserAgent('APL Analyzer')
  .lambda();

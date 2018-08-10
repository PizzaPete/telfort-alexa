const {login} = require('./auth.js');

require('dotenv').config();
const Alexa = require('ask-sdk-core');

const skillBuilder = Alexa.SkillBuilders.custom();

let token = null;

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = login();

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);
    
        return handlerInput.responseBuilder
            .speak('Sorry, I can\'t understand the command. Please say again.')
            .reprompt('Sorry, I can\'t understand the command. Please say again.')
            .getResponse();
    }
};

module.exports.hello = skillBuilder
	.addRequestHandlers(
		LaunchRequestHandler,
		SessionEndedRequestHandler
	)
	.addErrorHandlers(ErrorHandler)
	.lambda();

module.exports.http = () => {
  console.log("HTTP method called.." + getToken());
};


function getToken() {
    console.log("Fetching token...");
    if (!token) {
        login()
            .then((result) => console.log("token fetched: " + result.token))
            .catch((err) => console.log(err));
    }

    return token;
}
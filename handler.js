const {login} = require('./auth.js');
const {formatUsageSummary, getUsageSummary} = require('./usage.js');

require('dotenv').config();
const Alexa = require('ask-sdk-core');

const skillBuilder = Alexa.SkillBuilders.custom();

let token = null;

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'What do you want to know?'

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse();
    }
};

const UsageIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' 
            && handlerInput.requestEnvelope.request.intent.name === 'UsageIntent';
    },
    handle(handlerInput) {
        console.log('In Handler');
        return new Promise((resolve, reject) => {
             getUsage()
                .then((speechText) => {
                    resolve(handlerInput.responseBuilder
                        .speak(speechText)
                        .withSimpleCard('Hello World', speechText)
                        .getResponse());
                })
                .catch((err) => {
                    resolve(handlerInput.responseBuilder
                        .speak('Ophalen van je verbruik is mislukt')
                        .withSimpleCard('Error', err)
                        .getResponse());
                });
        });
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

module.exports.launch = skillBuilder
	.addRequestHandlers(
		LaunchRequestHandler,
        SessionEndedRequestHandler,
        UsageIntentHandler
	)
	.addErrorHandlers(ErrorHandler)
	.lambda();

function getUsage() {
    return Promise.resolve()
        .then(getToken)
        .then(getUsageSummary)
        .then(formatUsageSummary);
}

function getToken() {
    return new Promise((resolve, reject) => {
        if (!token) {
            console.log('Fetching token...');  
            login()
                .then((result) => {
                    console.log('Token fetched');
                    token = result.token;
                    resolve(result.token);
                })
                .catch((err) => {
                    reject(err); 
                });
        } else {
            resolve(token);
        }
    });
}
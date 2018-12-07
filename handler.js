const {login, getUserDetails} = require('./auth.js');
const {formatUsageSummary, getUsageSummary} = require('./usage.js');

require('dotenv').config();
const Alexa = require('ask-sdk-core');

const skillBuilder = Alexa.SkillBuilders.custom();

let userPassword = null;
let userUsername = null;
let userToken = null;

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const { accessToken } = handlerInput.requestEnvelope.context.System.user;
        const speechText = 'What do you want to know?'

        if (!accessToken) {
            speechText = 'You must authenticate with your Amazon Account to use this skill. I sent instructions for how to do this in your Alexa App';
            return handlerInput.responseBuilder
                .speak(speechText)
                .withLinkAccountCard()
                .getResponse();
          } else {
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(speechText)
                .withSimpleCard('Hello World', speechText)
                .getResponse();
        }
    }
};

const UsageIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'UsageIntent';
    },
    handle(handlerInput) {
        return new Promise((resolve, reject) => {
             getUsage(handlerInput)
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

function getUsage(handlerInput) {
    return Promise.resolve()
        .then(getLoginDetails(handlerInput))
        .then(getToken)
        .then(getUsageSummary)
        .then(formatUsageSummary);
}

function getLoginDetails(handlerInput) {
    return new Promise((resolve, reject) => {
        if (!userPassword || !userUsername) {
            getUserDetails(handlerInput)
                .then((result) => {
                    userPassword = result['https://alexa.telfort.nl/user_metadata'].password;
                    userUsername = result.nickname;
                    resolve(userPassword);
                })
                .catch((err) => {
                    reject(err);
                });
        } else {
            resolve(userPassword);
        }
    });
}

function getToken(handlerInput) {
    return new Promise((resolve, reject) => {
        if (!userToken) {
            login(userUsername, userPassword)
                .then((result) => {
                    userToken = result.token;
                    resolve(result.token);
                })
                .catch((err) => {
                    reject(err);
                });
        } else {
            resolve(userToken);
        }
    });
}
require('dotenv').config();
const Alexa = require('ask-sdk-core');
const https = require('https');
const querystring = require('querystring');

const skillBuilder = Alexa.SkillBuilders.custom();

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

module.exports.http = (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const postData = querystring.stringify({
        user: process.env.USERNAME,
        password: process.env.PASSWORD
    });

    let headers = {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
    };

    const options = {
        hostname: process.env.HOST,
        port: 443,
        path: `${process.env.PATHPREFIX}sso/auth`,
        method: 'POST',
        headers: headers,
        data: postData
    };

    // request object
    var req = https.request(options, function (res) {
        var result = '';
        res.on('data', function (chunk) {
            result += chunk;
        });
        res.on('end', function () {
            console.log(result);
        });
        res.on('error', function (err) {
            console.log(err);
        })
    });

    // req error
    req.on('error', function (err) {
        console.log(err);
    });

    //send request witht the postData form
    req.write(postData);
    req.end();

    /*const req = https.request(options, (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);
      
        res.on('data', (d) => {
            console.log(d);
          process.stdout.write(d);
        });
    });
      
    req.on('error', (e) => {
        console.error(e);
    });
    req.end();*/
};

module.exports.hello = skillBuilder
	.addRequestHandlers(
		LaunchRequestHandler,
		SessionEndedRequestHandler
	)
	.addErrorHandlers(ErrorHandler)
	.lambda();
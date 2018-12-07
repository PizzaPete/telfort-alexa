const https = require('https');
const querystring = require('querystring');

module.exports.login = (userUsername, userPassword) => {
    return new Promise((resolve, reject) => {
        const postData = querystring.stringify({
            user: userUsername,
            password: userPassword
        });

        let headers = {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        };

        const options = {
            hostname: process.env.HOST,
            port: 443,
            path: `${process.env.IDPATHPREFIX}sso/auth`,
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
                resolve(JSON.parse(result));
            });
            res.on('error', function (err) {
                reject(new Error('Login call failed' + err));
            })
        });

        // req error
        req.on('error', function (err) {
            reject(err);
        });

        //send request witht the postData form
        req.write(postData);
        req.end();
    });
};

module.exports.getUserDetails = (handlerInput) => {
    return new Promise((resolve, reject) => {
        const { accessToken } = handlerInput.requestEnvelope.context.System.user;
        let headers = {
            Accept: 'application/json',
            Authorization: 'Bearer ' + accessToken
        };

        const options = {
            hostname: process.env.AUTHHOST,
            port: 443,
            path: `${process.env.USERPATHPREFIX}`,
            method: 'GET',
            headers: headers
        };

        // request object
        var req = https.request(options, function (res) {
            var result = '';
            res.on('data', function (chunk) {
                result += chunk;
            });
            res.on('end', function () {
                resolve(JSON.parse(result));
            });
            res.on('error', function (err) {
                reject(new Error('Login call failed' + err));
            })
        });

        // req error
        req.on('error', function (err) {
            reject(err);
        });

        req.end();
    });
};
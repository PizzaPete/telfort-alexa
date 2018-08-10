const https = require('https');
const querystring = require('querystring');

module.exports.login = () => {
    return new Promise((resolve, reject) => {
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
                resolve(JSON.parse(result));
            });
            res.on('error', function (err) {
                console.log(err);
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
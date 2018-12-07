const https = require('https');

module.exports.getUsageSummary = (token) => {
    return new Promise((resolve, reject) => {

        let headers = {
            Accept: 'application/json',
            Cookie : 'SESSION=' + token
        };

        const options = {
            hostname: process.env.HOST,
            port: 443,
            path: `${process.env.PATHPREFIX}mobile/postpaid/v5/usage/summary`,
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
                reject(new Error('Invoices call failed' + err));
            })
        });

        // req error
        req.on('error', function (err) {
            reject(err);
        });

        req.end();
    });
};

module.exports.formatUsageSummary = (usage) => {
    return new Promise((resolve, reject) => {
        let resultText = 'You\'ve got ';
        usage.subscriptionUsage.forEach(element => {
            if(element.bundleType === 'DATA') {
                if(element.unlimited) {
                    resultText += `unlimited data `;
                } else {
                    resultText += `${element.remainingUnitsLabel}, `;
                }
            }
            if(element.bundleType === 'MINUTES') {
                if(element.unlimited) {
                    resultText += `unlimited phonecalls `;
                } else {
                    resultText += `${element.remainingUnits} minutes, `;
                }
            }
            if(element.bundleType === 'TEXT') {
                if(element.unlimited) {
                    resultText += `unlimited texting `;
                } else {
                    resultText += `${element.remainingUnitsLabel} `;
                }
            }
        });
        resultText += `left.`;
        resolve(resultText);
    });
};
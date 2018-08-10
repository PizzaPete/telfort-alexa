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
                console.log(err);
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
        let resultText = 'Bruhhhhhhhhh, je hebt nog ';
        usage.subscriptionUsage.forEach(element => {
            if(element.bundleType === 'DATA') {
                if(element.unlimited) {
                    resultText += `onbeperkt data, `;
                } else {
                    resultText += `${element.remainingUnitsLabel}, `;
                }
            }
            if(element.bundleType === 'MINUTES') {
                if(element.unlimited) {
                    resultText += `onbeperkt bellen, `;
                } else {
                    resultText += `${element.remainingUnits} minuten, `;
                }
            }
            if(element.bundleType === 'TEXT') {
                if(element.unlimited) {
                    resultText += `onbeperkt smsen. `;
                    resultText += `Dus waarom stuur je je moeder geen berichtje? `;
                } else {
                    resultText += `${element.remainingUnitsLabel}.`;
                }
            }
        });
        resolve(resultText);
    });
};
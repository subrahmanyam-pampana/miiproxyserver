var request = require('request');
const fs = require('fs')
const readline = require('readline');

const configs = JSON.parse(fs.readFileSync('./configs.json'))
const cookiesFilePath = './data/cookies.txt';
const cookie = fs.readFileSync(cookiesFilePath).toString();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    hideEchoBack: true
});

// target URL
var options = {
    url: configs.server + '/XMII/Illuminator',
    method: 'GET',
    auth: {
        user: configs.userName,
        pass: ''
    }
};

function isCookieExpired(cookieStr) {
    if (cookieStr === "")
        return true

    const jar = request.jar();
    const url = new URL(configs.server + '/XMII/Illuminator');
    jar.setCookie(cookieStr, url);
    const cookies = jar.getCookies(url);
    const curCookie = cookies[0];
    return curCookie && curCookie.expires && new Date(curCookie.expires).getTime() <= Date.now();
}

async function getCookie() {

    try {
        // Check if current cookie is expired
        if (isCookieExpired(cookie)) throw new Error('Expired cookie')
        return cookie
    } catch (error) {
        console.log("Your session to MII server is expired. Please relogin!")
        console.log(`MII server: ${configs.server}`);
        console.log(`User name: ${configs.userName}`);

        const userInput = await new Promise((res, rej) => {
            rl.question('Please Enter your password: ', res);
        });

        try {
            options.auth.pass = userInput;
            const _cookie = await requestCookie();
            fs.writeFileSync(cookiesFilePath, _cookie);
            return _cookie;

        } catch (error) {
            console.error('Unable to retrieve new cookie:', error);
            throw error; // Rethrow error for higher-level error handling
        }
    }
}

function requestCookie() {
    return new Promise((resolve, reject) => {
        request(options,
            (error, response, body) => {
                if (!error && (response.statusCode === 200 || response.statusCode === 201)) {
                    resolve(response.headers['set-cookie'][0])
                } else {
                    console.log("error=>", error)
                    reject(error)
                }
            })
    })
}


module.exports = {
    getCookie
}

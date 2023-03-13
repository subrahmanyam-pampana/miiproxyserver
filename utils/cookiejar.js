const request = require('request');
const {CookieJar } = require('tough-cookie');
const fs = require('fs');
const prompt = require('prompt');
const cheerio = require('cheerio');
const crypto = require('crypto');

const configs = JSON.parse(fs.readFileSync('./configs.json'));

// Load cookie jar from file if it exists
let jar;

if (fs.existsSync('./data/cookies.txt')) {
    const rawCookies = decryptcookie(fs.readFileSync('./data/cookies.txt', 'utf8'), 'xxxxxx')
    jar = CookieJar.fromJSON(rawCookies);
} else {
    jar = new CookieJar()
}

async function promptPassword() {
    prompt.start()
    prompt.message = ''
    prompt.delimiter = ':'
    const { password } = await prompt.get({
        properties: {
            password: {
                message: 'Password',
                hidden: true,
                replace: '*'
            }
        }
    })

    return password
}

// target URL
const options = {
    url: configs.server + '/XMII/Illuminator',
    method: 'GET',
    headers: {
        'Content-Type': 'application/xml'
    },
    auth: {
        user: configs.userName,
        pass: ''
    },
    jar
};

function getJar() {
    return new Promise(async (resolve, reject) => {
        let cookies = await jar.getCookies(options.url)
        if (!cookies.length) {
            console.log("Please Login to MII Server")
            console.log(`MII server: ${configs.server}`);
            console.log(`User name: ${configs.userName}`);
            const password = await promptPassword()
            if (password) {
                options.auth.pass = password
                request(options, (error, response, body) => {
                    try {
                        if (!error && response.statusCode === 200) {
                            const $ = cheerio.load(body);
                            if ($('.urLogonTable').html() === null) {
                                // Save cookie jar to file
                                const serializedCookies = JSON.stringify(jar.toJSON())
                                fs.writeFileSync('./data/cookies.txt', encryptcookie(serializedCookies, password));
                                resolve(jar);
                            } else {
                                // Session expired or invalid credentials
                                reject("Invalid Credentials or Session Expired. Please relogin")
                            }

                        } else {
                            reject(error);
                        }
                    } catch (err) {
                        reject(err);
                    }
                });
            } else {
                console.log("Please Enter a valid password")
                getJar()
            }
        } else {
            console.log(jar)
            resolve(jar)
        }
    });
}

function encryptcookie(data, key) {
    const algorithm = 'aes-256-cbc';
    if (key.length < 32) {
        key += 'abcdefghijklmnopqrstuvwxyz0123456789'.slice(0, 32 - key.length)
    }
    const iv = key.slice(0, 16)
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted

}

function decryptcookie(encryptedContent, key) {
    if (key.length < 32) {
        key += 'abcdefghijklmnopqrstuvwxyz0123456789'.slice(0, 32 - key.length)
    }
    const algorithm = 'aes-256-cbc'
    const iv = key.slice(0, 16)
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decryptedText = decipher.update(encryptedContent, 'hex', 'utf8');
    decryptedText += decipher.final();
    //decryptedText = JSON.parse(decryptedText)
    return decryptedText;
}

module.exports = {
    getJar
}






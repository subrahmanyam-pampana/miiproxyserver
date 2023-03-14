var request = require('request');
const fs = require('fs')
const prompt = require('prompt')
const cheerio = require('cheerio');

const configs = JSON.parse(fs.readFileSync('./configs.json'))
const jar = request.jar()

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
        console.log("Please Login to MII Server")
        console.log(`MII server: ${configs.server}`);
        console.log(`User name: ${configs.userName}`);
        const password = await promptPassword()
        if (password) {
            options.auth.pass = password
        } else {
            console.log("Please Enter a valid password")
            getJar()
        }

        request(options, (error, response, body) => {
            try {
                if (!error && response.statusCode === 200) {
                    const $ = cheerio.load(body);
                    if($('.urLogonTable').html() === null){
                        resolve(jar)
                    }else{
                        reject("Invalid Credentials. Please relogin")
                    }

                } else {
                    reject(error)
                }
            } catch (err) {
                reject(err)
            }
        })
    })
}

module.exports = {
   getJar
}

const express = require('express');
const request = require('request')
const bodyParser = require('body-parser');
const readline = require('readline');
const fs = require('fs');
const updateModified = require('./utils/updateModified')
const app = express();
let cookie;
const cookiesFilePath = "./data/cookies.txt"
const oAuth = {
    user: '',
    pass: ''
}
let mii_server = '';

app.use(bodyParser.urlencoded({
    extended: true
}));


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    hideEchoBack: true
});

app.use(express.static('webapp'))

fs.readFile('configs.json', (err, data) => {
    if (!err) {
        data = JSON.parse(data)
        oAuth.user = data.userName
        mii_server = data.server

        configureEndPoints(data.endPoints)
        app.listen(data.LocalPort, () => {
            console.log('listening at port ' + data.LocalPort)
            console.log("mii server: " + mii_server)
            console.log("user name: " + oAuth.user)
            rl.question('Enter your password: ', (userInput) => {
                // userInput contains the user's input
                oAuth.pass = userInput
                rl.close();
                readCookie()
                console.log("go to this url see the ui5 app", "http://localhost:" + data.LocalPort + "/index.html")
            });

        })


    } else {
        console.log(err)
    }
})

//request the cookie
function readCookie() {
    fs.readFile(cookiesFilePath, 'utf-8', (err, data) => {
        if (err) throw err;
        if (!data) {
            requestCookie().then((_cookie) => {
                cookie = _cookie
                fs.writeFile(cookiesFilePath, cookie, error => {
                    if (error) throw error
                })
            })
        } else {

            //check if cookie expired or not
            request.get(`${mii_server}/XMII/Illuminator`,
                {
                    headers: {
                        'Cookie': cookie,
                    }
                },
                (error, response, body) => {
                    //incase cookie expire, then get new cookie

                    if (!error && (response.statusCode === 200 || response.statusCode === 201)) {
                        cookie = data;

                    } else {
                        console.log(error)
                        requestCookie().then((_cookireadCookiee) => {
                            cookie = _cookie
                            fs.writeFile(cookiesFilePath, cookie, error => {
                                if (error) throw error

                            })
                        })
                        return
                    }

                })
        }

    })
}

//request for cookie
function requestCookie() {
    return new Promise((resolve, reject) => {
        request.get(`${mii_server}/XMII/Illuminator`,
            {
                'auth': oAuth
            },
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

function configureEndPoints(endPoints) {
    //get end points
    endPoints.get.forEach(endPoint => {
        app.get(endPoint, (req, res) => {
            get_data(req.query, 'Illuminator').then(data => {
                if (req.query['Content-Type'] === 'text/xml') {
                    res.set('Content-Type', 'application/xml')
                }
                res.send(data)
            })
        })
    })

    //post end points

    endPoints.get.forEach(endPoint => {
        app.post(endPoint, (req, res) => {
            post_data(req.body, 'Illuminator').then(data => {
                if (req.body['Content-Type'] === 'text/xml') {
                    res.set('Content-Type', 'application/xml')
                }
                res.send(data)
            })
        })
    })
}

function get_data(query, service) {
    return new Promise((resolve, reject) => {
        request.get(`${mii_server}/XMII/${service}?${parse_param_str(query)}`,
            {
                // 'auth':oAuth,
                headers: {
                    'Cookie': cookie,
                },

                'json': (query['Content-Type'] === 'text/json') ? true : false
            },
            (error, response, body) => {
                if (error) {
                    reject(response)
                } else {
                    resolve(body)
                }
            })
    })
}

function post_data(query, service) {
    return new Promise((resolve, reject) => {
        request.post(`${mii_server}/XMII/${service}?${parse_param_str(query)}`,
            {
                // 'auth':oAuth,
                headers: {
                    'Cookie': cookie,
                },
                'json': (query['Content-Type'] === 'text/json') ? true : false
            },
            (error, response, body) => {
                if (error) {

                    reject(response)
                } else {
                    resolve(body)
                }
            })
    })
}

function parse_param_str(obj) {
    let paramStr = ''
    let keys = Object.keys(obj)
    for (let key of keys) {
        paramStr += key + '=' + obj[key] + '&'
    }
    return paramStr
}

updateModified()



const express = require('express');
const request = require('request')
const bodyParser = require('body-parser');
const fs = require('fs');
const updateModified = require('./utils/updateModified')
const app = express();
let cookie;
const configs = JSON.parse(fs.readFileSync('./configs.json'))
const { getCookie } = require('./utils/getCookie')

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static('webapp'))

configureEndPoints(configs.endPoints)

app.listen(configs.LocalPort, () => {
    console.log('listening at port ' + configs.LocalPort)
    getCookie().then(_cookie=>{
        cookie = _cookie
        console.log("go to this url see the ui5 app", "http://localhost:" + configs.LocalPort + "/index.html")
    })
})

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
        request.get(`${configs.server}/XMII/${service}?${parse_param_str(query)}`,
            {
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
        request.post(`${configs.server}/XMII/${service}?${parse_param_str(query)}`,
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



const express = require('express');
const request = require('request')
const bodyParser = require('body-parser');
const fs = require('fs');

const updateModified = require('./utils/updateModified')
const app = express();
const configs = JSON.parse(fs.readFileSync('./configs.json'))
const { getCookie,getJar } = require('./utils/getCookie')
let jar;

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static('webapp'))

configureEndPoints(configs.endPoints)

app.listen(configs.LocalPort, () => {
    console.log('listening at port ' + configs.LocalPort)
    getJar().then(_jar=>{
        jar = _jar
        console.log("go to this url see the ui5 app", "http://localhost:" + configs.LocalPort + "/index.html")
    }).catch((err)=>{
        console.log(err)
    })
})

function configureEndPoints(endPoints) {
    //get end points
    endPoints.get.forEach(endPoint => {
        app.get(endPoint, (req, res) => {
            get_data(req.query, endPoint).then(data => {
                if (req.query['Content-Type'] === 'text/xml') {
                    res.set('Content-Type', 'application/xml')
                }
                res.send(data)
            })
        })
    })

    //post end points

    endPoints.post.forEach(endPoint => {
        app.post(endPoint, (req, res) => {
            post_data(req.body, endPoint).then(data => {
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
        request({
            url: `${configs.server}${service}`,
            method: 'get',
            headers: {
                // 'Cookie': cookie,
                'Content-Type': (query['Content-Type'] === 'text/json') ? 'application/json' : 'application/xml'
            },
            'json': (query['Content-Type'] === 'text/json') ? true : false,
            qs: query,
            jar:jar
        }, (error, response, body) => {
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
        request({
            url: `${configs.server}${service}`,
            method: 'post',
            headers: {
                // 'Cookie': cookie,
                'Content-Type': (query['Content-Type'] === 'text/json') ? 'application/json' : 'application/xml'
            },
            'json': (query['Content-Type'] === 'text/json') ? true : false,
            qs: query,
            jar:jar
        }, (error, response, body) => {
            if (error) {
                reject(response)
            } else {
                resolve(body)
            }
        })
    })
}

updateModified()



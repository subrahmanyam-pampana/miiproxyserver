const fs = require('fs');
const request = require('request');
const { parse_param_str, isFile } = require('./util')
const xml2js = require('xml2js');
const configs = JSON.parse(fs.readFileSync('./configs.json'))
const modifiedFiles = JSON.parse(fs.readFileSync('./data/modifiedFiles.json'))
const cookie = fs.readFileSync('./data/cookies.txt')

if (cookie.length === 0) {
    console.log("Credentials expired. Please restart the server")
    return
}

function pushFilestoMII() {
  let failed_files = []
  let promiseArray = []
  if(Object.keys(modifiedFiles).length===0){
    console.log("No new Modifications found!")
    return
  }
  console.log('Below files are pushed to MII')
  for (let file of Object.keys(modifiedFiles)) {
    const promise = new Promise((resolve, reject) => {
      saveFile(modifiedFiles[file].path, fs.readFileSync(`./webapp/${file}`)).then((res) => {
        if (res && !res.FatalError) {
          console.log(file)
          delete modifiedFiles[file]
          resolve()
        } else {
          failed_files.push(file)
          reject()
        }
      }).catch((err) => {
        console.log(err)
        reject()
      })
    })
    promiseArray.push(promise)
  }

  Promise.all(promiseArray).then(() => {
    if (failed_files.length > 0) {
      console.log("below files are failed to push to MII. Please push again")
      console.log(failed_files)
    }
    fs.writeFileSync('./data/modifiedFiles.json', JSON.stringify(modifiedFiles))
  })
}


function saveFile(filePath, content) {
    const bufferObj = Buffer.from(content, 'utf-8');
    const base64String = bufferObj.toString('base64');
    const params = {
        'Mode': 'SaveBinary',
        'Class': 'Content',
        'ObjectName': filePath,
        'Content': encodeURIComponent(base64String)
    }

    const options = {
        url: `${configs.server}/XMII/Catalog?${parse_param_str(params)}`,
        method: 'POST',
        headers: {
            'Cookie': cookie,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        }
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {

                xml2js.parseString(body, function (err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result)
                    }

                });

            } else {
                reject(response)
            }
        });
    })

}

pushFilestoMII()




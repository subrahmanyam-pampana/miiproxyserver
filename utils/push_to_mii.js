const fs = require('fs');
const request = require('request');
const xml2js = require('xml2js');

const configs = JSON.parse(fs.readFileSync('./configs.json'))
const modifiedFiles = JSON.parse(fs.readFileSync('./data/modifiedFiles.json'))
const { getJar } = require('./getCookie');
let jar;

async function pushFilestoMII() {
  let failed_files = []
  let promiseArray = []
  if (Object.keys(modifiedFiles).length === 0) {
    console.log("No new Modifications found!")
    return
  }
  console.log('Below files are pushed to MII')
  for (let file of Object.keys(modifiedFiles)) {
    if (modifiedFiles[file].status === 'deleted') {
      console.log(modifiedFiles[file].path, ", can't push this deleted file in your local directory to mii wb")
      delete modifiedFiles[file]
      continue;
    }
    const promise = new Promise((resolve, reject) => {
      saveFile(modifiedFiles[file].path, fs.readFileSync(`./webapp/${file}`)).then((res) => {
        console.log(res)
        if (res && !res.FatalError) {
          console.log(modifiedFiles[file].path)
          delete modifiedFiles[file]
          resolve("File saved Successfully")
        } else {
          failed_files.push(file)
          reject(res.FatalError)
        }
      }).catch((err) => {
        reject(err)
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
  }).catch(err => console.log(err))
}

function saveFile(filePath, content) {
  return new Promise((resolve, reject) => {
    const bufferObj = Buffer.from(content, 'utf-8');
    const base64String = bufferObj.toString('base64')
    const params = {
      'Mode': 'SaveBinary',
      'Class': 'Content',
      'ObjectName': filePath,
      'Content': base64String
    }

    const options = {
      url: `${configs.server}/XMII/Catalog`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      qs: params,
      jar: jar
    };

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
        reject(error)
      }
    });
  })

}


getJar().then(_jar => {
  jar = _jar
  pushFilestoMII().catch(err => console.log(err))

}).catch(err => {
  console.log(err)
})






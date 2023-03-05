const fs = require('fs')
const mii_root_folder_path = JSON.parse(fs.readFileSync('./configs.json')).miiRootFolder
const {parse_param_str,isFile} = require('./util')

module.exports = function updateModified(){
    fs.watch('./webapp', { recursive: true }, (eventType, filename) => {
      let modifiedFiles =  JSON.parse(fs.readFileSync('./data/modifiedFiles.json'))
      filename = filename.replaceAll('\\','/')
        if (isFile('./webapp/'+filename)) {
          if(!modifiedFiles[filename]){
            modifiedFiles[filename] = {
              "path":`${mii_root_folder_path}/webapp/${filename}`,
              "status":"changed",
              "type":"file"
            }
          }else{
            modifiedFiles[filename].status = "changed"
          }
        }
        fs.writeFileSync('./data/modifiedFiles.json', JSON.stringify(modifiedFiles))
    });
}




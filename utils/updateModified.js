const fs = require('fs')
const mii_root_folder_path = JSON.parse(fs.readFileSync('./configs.json')).miiRootFolder
const {isFile } = require('./util')

module.exports = function updateModified() {
  try {
    fs.watch('./webapp', { recursive: true }, (eventType, filename) => {
      let modifiedFiles = JSON.parse(fs.readFileSync('./data/modifiedFiles.json'))
      filename = filename.replaceAll('\\', '/')
      let filePath = './webapp/' + filename
 
      //checking for file deletion
      if (eventType === 'rename' && !fs.existsSync(filePath)) {
        modifiedFiles[filename].status = "deleted"
      } else if(isFile(filePath)) {
        if (!modifiedFiles[filename]) {
          modifiedFiles[filename] = {
            "path": `${mii_root_folder_path}/webapp/${filename}`,
            "status": "changed",
            "type": "file"
          }
        } else if(modifiedFiles[filename].status!=="deleted"){
          modifiedFiles[filename].status = "changed"
        }
      }
      fs.writeFileSync('./data/modifiedFiles.json', JSON.stringify(modifiedFiles))
    });
  } catch (err) {

  }

}




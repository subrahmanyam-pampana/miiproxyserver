const fs = require('fs')

function parse_param_str(obj) {
    let paramStr = ''
    let keys = Object.keys(obj)
    for (let key of keys) {
        paramStr += key + '=' + obj[key] + '&'
    }
    return paramStr
}

function isFile(path) {
    try {
      const stats = fs.lstatSync(path)
      return stats.isDirectory() ? false : true
    } catch (error) {
      console.error(error)
      return false 
    }
  }

module.exports = {
    parse_param_str,
    isFile
}

const fs = require('fs')
const request = require('request')
const xml2js = require('xml2js');
const {getCookie} = require('./getCookie')

const configs = JSON.parse(fs.readFileSync('./configs.json'))
const parser = new xml2js.Parser({ explicitArray: false });
let cookie;

function getFilesList(folderPath,type) {
    return new Promise((resolve, reject) => {
        request({
            url: `${configs.server}/XMII/Catalog`,
            method: 'post',
            headers:{
                cookie:cookie
            },
            qs: {
                'Mode': (type==='folder'?'ListFolders':'List'),
                'Session': true,
                'DoStateCheck': true,
                'Content-Type': 'text/xml',
                'Folder': folderPath
            }
        }, (error, res, body) => {
            if (error) {
                console.log("Error while getting the filesList.function:getFilesList, error: "+error)
                reject(error)
            } else {
                if(res && res.statusCode===200){
                    parser.parseString(body, (err, result) => {
                        if (err) {
                            console.log("Error while parsing the xml to json.function:getFilesList, error: "+err);
                            reject(err)
                        } else {
                            let res = (result.Rowsets.Rowset.Row!==undefined)?result.Rowsets.Rowset.Row:[]
                            if(!Array.isArray(res)) res= [res] 
                            resolve(res)
                        }
                    });
                }else{
                    console.log("Error while getting the filesList.Status code is not 200 or 201.function:getFilesList, error: "+error)
                    reject(error)
                }
                
            }
        });
    })
}

async function dfs(filePath) {
    // let files = await getFilesList(filePath,'file')
    // let folders = await getFilesList(filePath,'folder')
    let [files, folders] = await Promise.all([
        getFilesList(filePath, 'file'),
        getFilesList(filePath, 'folder')
      ]);

    for(let folder of folders){
        let path = getLocalFilePath(folder.Path)
        fs.mkdir(path,(err)=>{
            if(err && err.code!=='EEXIST'){
                console.log("Error while creating the folder. function: dfc, path: "+path+", error: "+err)
            }
        })
        dfs(folder.Path)
    }

    for(let file of files){
        let path = getLocalFilePath(file.FilePath+'/'+file.ObjectName)
        readMIIFile(file.FilePath+'/'+file.ObjectName).then((content)=>{
            fs.writeFile(path,content,err=>{
                if(err){
                    console.log("Error while writing to file. function: dfs, path: "+path+" error: "+err)
                    reject(err)
                }
                    
            })
        })
    }
}
function getLocalFilePath(path){
    let idx = path.split('/').findIndex(val=>val==='webapp')
    return './'+path.split('/').slice(idx).join('/')
}

function readMIIFile(path){
    return new Promise((resolve,reject)=>{
        request({
            url:`${configs.server}/XMII/Catalog`,
            method:'get',
            headers:{
                cookie:cookie
            },
            qs:{
                Mode:'LoadBinary',
                Class:'Content',
                TemporaryFile:false,
                'Content-Type':'text/json',
                ObjectName:path
            },
            json:true
        },(err,res,body)=>{
            if(!err && (res.statusCode===200 || res.statusCode===201)){
                try{
                    let b64Content = body.Rowsets.Rowset[0].Row[2] && body.Rowsets.Rowset[0].Row[2].Value
                    resolve(Buffer.from(b64Content,'base64').toString())
                }catch(err){
                    reject(err)
                }
               
            }else{
                reject(err,res)
            }
        })
    })
}

getCookie().then((_cookie)=>{
    cookie = _cookie
    dfs(configs.miiRootFolder).then(()=>{
        console.log("code pulled from mii and placed all the resources in webapp folder")
    })
})
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import { url } from "../dbconnection";

export function storageFiles() {
    let fileStorage = multer.diskStorage({
        destination: "uploads",
        filename: (req, file, cb) =>{
            let fileName = file.originalname

            fileName = fileName.substr(0, fileName.indexOf('.')) + "_" + Date.now() + 
                        fileName.substr(fileName.indexOf("."));

            cb(null, fileName)
        }
    })

    let fileUpload = multer({ storage: fileStorage});
    return fileUpload;
}

// will create bucket and store file in it
export function gridStorage(){
    let storageFS = new GridFsStorage({
        url,
        file: (req, file) => {
            console.log(req['bucketName'])
            return {
                filename: file.originalname.substr(0, file.originalname.indexOf('.')) + "_" + Date.now() + 
                file.originalname.substr(file.originalname.indexOf(".")),
                bucketName: req['bucketName']
            }
        }
    })

    let uploadsGrid = multer({storage: storageFS})
    return uploadsGrid;
}
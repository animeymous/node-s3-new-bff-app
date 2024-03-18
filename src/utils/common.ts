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
            return {
                filename: file.originalname,
                bucketName: "gridUploads"
            }
        }
    })

    let uploadsGrid = multer({storage: storageFS})
    return uploadsGrid;
}
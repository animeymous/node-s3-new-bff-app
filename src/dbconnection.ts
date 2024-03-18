import mongoose from "mongoose";

export const url = "mongodb://127.0.0.1/node-s3";
export let gridBucket;

export function mongooseConnection(){
    try{
        mongoose.connect(url, {}).then(data => {
            let db = data.connection.db;
            gridBucket = new mongoose.mongo.GridFSBucket(db, {
                bucketName: "gridUploads"
            })
        });
    }catch(error) {
        console.log(error)
    }
}
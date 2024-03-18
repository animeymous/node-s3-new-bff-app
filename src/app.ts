import express from "express";
import {gridBucket, mongooseConnection} from "./dbconnection"
import { gridStorage, storageFiles } from "./utils/common"
import { MongoClient, GridFSBucket } from "mongodb";


const app = express();

const PORT = 3000;

app.listen(PORT, () => {
    console.log("Connected to " + PORT)
})

mongooseConnection()

app.get("/test", (req, res) => {
    res.send({status: 200, msg: "success"})
})

// Create a dynamic middleware function that attaches the bucketname to the request object
const dynamicBucketMiddleware = (req, res, next) => {
    const bucketName = req.params.bucketName;
    req.bucketName = bucketName;
    next();
};

// File Upload in Bucket, bucketname will dynamic
app.post("/uploads/:bucketName", dynamicBucketMiddleware, gridStorage().single("file"), (req, res)=> {
    try{
        res.send({status: 200, msg: "File uploaded"})
    }catch(error: any){
        res.send({status: 400, msg: error.message})
    }
})

// will get file from bucket
app.get("/gridStorage/:bucketName/:fileName", async (req, res) =>{
    try{
        MongoClient.connect("mongodb://127.0.0.1/node-s3")
        .then(data=>{
            const bucket = new GridFSBucket(data.db(), {
                bucketName: req.params.bucketName
              })

            bucket.find({filename: req.params.fileName}).toArray().then(file => {
                bucket.openDownloadStreamByName(req.params.fileName).pipe(res)
            })
        })
    }catch(error: any){
        res.send({status: 400, msg: error.message})
    }
})

// will get all file from bucket
app.get("/gridStorage/:bucketName", async (req, res) =>{
    try{
        MongoClient.connect("mongodb://127.0.0.1/node-s3")
        .then(data=>{
            const bucket = new GridFSBucket(data.db(), {
                bucketName: req.params.bucketName
              })

            bucket.find({}).toArray().then(allFiles => {
                res.send({status: 200, allFiles: allFiles})
            })
        })
    }catch(error: any){
        res.send({status: 400, msg: error.message})
    }
})


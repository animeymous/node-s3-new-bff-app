import express from "express";
import cors from "cors"
import {mongooseConnection} from "./dbconnection"
import { gridStorage } from "./utils/common"
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";

const app = express();
app.use(cors())
const PORT = 3000;

app.listen(PORT, () => {
    console.log("Connected to " + PORT)
})

mongooseConnection()

// Create a dynamic middleware function that attaches the bucketname to the request object
const dynamicBucketMiddleware = (req, res, next) => {
    const bucketName = req.params.bucketName;
    req.bucketName = bucketName;
    next();
};

// GET Object
app.get("/gridStorage/:bucketName/:fileName", async (req, res) =>{
    try{
        MongoClient.connect("mongodb://127.0.0.1/node-s3")
        .then(data=>{
            const bucket = new GridFSBucket(data.db(), {
                bucketName: req.params.bucketName
              })

            // incase if have to find file by id
            // bucket.find({_id: new ObjectId(req.params.fileName)}).toArray().then(data => {
            //     bucket.openDownloadStream(new ObjectId(req.params.fileName)).pipe(res)
            // })

            bucket.find({filename: req.params.fileName}).toArray().then(file => {
                if(file.length < 1){
                    res.send({status: 400, msg: "object not found"})
                }else{
                    bucket.openDownloadStreamByName(req.params.fileName).pipe(res)
                }
            })
        })
    }catch(error: any){
        res.send({status: 400, msg: error.message})
    }
})

// PUT Object
app.post("/uploads/:bucketName", dynamicBucketMiddleware, gridStorage().single("file"), (req, res)=> {
    try{
        res.send({status: 200, msg: "File uploaded"})
    }catch(error: any){
        res.send({status: 400, msg: error.message})
    }
})

// Delete Object
app.delete("/gridStorage/:bucketName/:id", async (req, res) =>{
    try{
        MongoClient.connect("mongodb://127.0.0.1/node-s3")
        .then(data=>{
            const bucket = new GridFSBucket(data.db(), {
                bucketName: req.params.bucketName
              })

            bucket.delete(new ObjectId(req.params.id))
            .then(data => {
                res.send({status: 200, msg: "Object deleted successfully"})
            })
            .catch(error => {
                res.status(400).send({msg: error.message})
            })
        })
    }catch(error: any){
        res.send({status: 400, msg: error.message})
    }
})

// List Objects
app.get("/gridStorage/:bucketName", async (req, res) =>{
    try{
        MongoClient.connect("mongodb://127.0.0.1/node-s3")
        .then(data=>{
            const bucket = new GridFSBucket(data.db(), {
                bucketName: req.params.bucketName
              })

            bucket.find({}).toArray().then(allListsInBucket => {
                res.send({status: 200, allListsInBucket: allListsInBucket})
            })
        })
    }catch(error: any){
        res.send({status: 400, msg: error.message})
    }
})

// List buckets
app.get("/gridStorage", async (req, res) =>{
    try{
        MongoClient.connect("mongodb://127.0.0.1/node-s3")
        .then(data=>{
            // console.log(data)
            const db = data.db()
            db.listCollections().toArray().then((collectionNames) => {
            const bucketNames = collectionNames
                .filter((collection) => collection.name.endsWith('.files'))
                    .map((collection) => collection.name.replace('.files', ''));

                res.send({status: 200, bucketNames: bucketNames})
            })
        })
    }catch(error: any){
        res.send({status: 400, msg: error.message})
    }
})

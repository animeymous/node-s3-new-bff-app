import express from "express";
import {mongooseConnection} from "./dbconnection"
import { gridStorage } from "./utils/common"
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import mongoose from "mongoose";

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

// PUT Object
app.post("/uploads/:bucketName", dynamicBucketMiddleware, gridStorage().single("file"), (req, res)=> {
    try{
        res.send({status: 200, msg: "File uploaded"})
    }catch(error: any){
        res.send({status: 400, msg: error.message})
    }
})

// GET Object
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

// List Objects
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

// Delete Object
app.delete("/gridStorage/:bucketName/:id", async (req, res) =>{
    try{
        MongoClient.connect("mongodb://127.0.0.1/node-s3")
        .then(data=>{
            const bucket = new GridFSBucket(data.db(), {
                bucketName: req.params.bucketName
              })

            bucket.delete(new ObjectId(req.params.id)).then(data => {
                res.send({status: 200, msg: "Object deleted successfully"})
            })
        })
    }catch(error: any){
        res.send({status: 400, msg: error.message})
    }
})

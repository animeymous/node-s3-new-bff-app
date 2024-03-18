import express from "express";
import {gridBucket, mongooseConnection} from "./dbconnection"
import { gridStorage, storageFiles } from "./utils/common"
import * as mongodb from "mongodb"

const app = express();

const PORT = 3000;

app.listen(PORT, () => {
    console.log("Connected to " + PORT)
})

mongooseConnection()

app.get("/test", (req, res) => {
    res.send({status: 200, msg: "success"})
})

app.post("/uploads", gridStorage().single("file"), (req, res)=> {
    try{
        res.status(200).json({"msg": "done"})
    }catch(error: any){
        res.send({status: 400, msg: error.message})
    }
})

app.get("/gridStorage/:fileName", async (req, res) =>{
    try{

        let paramFileName = req.params.fileName;
        let file = gridBucket.find({filename: paramFileName}).toArray((err, result: any) => {
            if(err){
                res.send({status: 400, msg: err.message})
                console.log(err)
            }else{
                if(!result || result.length == 0){
                    res.send({status: 201, msg: "File does not exist"})
                }else{
                    gridBucket.openDownloadStreamByName(paramFileName).pipe(res)
                    res.status(200).json({"msg": "done"})
                }
            }
        })
       
    }catch(error: any){
        res.send({status: 400, msg: error.message})
    }
})


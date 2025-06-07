import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const PORT=process.env.PORT || 3000;
const app = express();


app.use(cors());
app.use(express.json());

mongoose
    .connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("MONGO CONNECTED");
        app.listen(PORT,()=>{
            console.log(`Server is running at http://localhost:${PORT}`);
        })
    })
    .catch((err)=>{
        console.log("Mongo error",err);
    });


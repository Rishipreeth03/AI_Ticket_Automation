import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/user.js"
import ticketRoutes from "./routes/ticket.js"
import {serve} from "inngest/express" 
import {inngest} from "./inngest/client.js"
import { onUserSignup } from "./inngest/functions/on-signup.js";
import { onTicketCreated } from "./inngest/functions/on-ticket-create.js";
import dotenv from 'dotenv'

dotenv.config();

const PORT=process.env.PORT || 3000;
const app = express();


app.use(cors());
app.use(express.json());

app.use("/api/auth",userRoutes);
app.use("/api/ticket",ticketRoutes);

app.use(
    "/api/inngest",
    serve({
        client:inngest,
        functions:[onUserSignup,onTicketCreated]
    })
);

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


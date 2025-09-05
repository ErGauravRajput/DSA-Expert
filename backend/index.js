import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import aiRouter from "./airoute.js"; // use .js and default import

const app = express();

const port=process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'https://dsa-expert.vercel.app/'
];

app.use(cors({
    origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}))

app.use(express.json());

app.use('/ai',aiRouter);


const InitalizeConnection = async ()=>{
    try{
        app.listen(port, ()=>{
            console.log("Server listening at port number: "+ port );
        })
    }
    catch(err){
        console.log("Error: "+err);
    }
}


InitalizeConnection();













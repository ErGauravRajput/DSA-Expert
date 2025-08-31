import express from "express";   
import  solveDoubt  from "./chatai.js"; 

const aiRouter = express.Router();

aiRouter.post("/chat", solveDoubt);

export default aiRouter;  
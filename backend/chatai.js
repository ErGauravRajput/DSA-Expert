import * as dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});
const History = []

// model used for to tranform the user question to a complete question

async function transformQuery(question){

History.push({
    role:'user',
    parts:[{text:question}]
    })  

const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: History,
    config: {
      systemInstruction: `You are a query rewriting expert. Based on the provided chat history, rephrase the "Follow Up user Question" into a complete, standalone question that can be understood without the chat history.
    Only output the rewritten question and nothing else.
      `,
    },
 });
 
 History.pop()
 
 return response.text
}


const solveDoubt = async(req , res)=>{

try{
  const question=req.body.messages;

  const transformQuestion= await transformQuery(question);

const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'text-embedding-004',
    });
     
     // convert user problem in vector
    // here we have only one user querry so we directly change it to vector using embedding model and do not use langchain
   const queryVector = await embeddings.embedQuery(transformQuestion);   

  // make connection with pinecone database to search the user querry

   const pinecone = new Pinecone();
   const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

   const searchResults = await pineconeIndex.query({
    topK: 2,
    vector: queryVector,
    includeMetadata: true,
    });
 
    // in search result we have 10 meta data now we select the part of text of meta data metadata->text;
    const context = searchResults.matches
                   .map(match => match.metadata.text)
                   .join("\n\n---\n\n");
    
    // now we have a context for the LLM model to give ans the user
    History.push({
    role:'user',
    parts:[{text:transformQuestion}]
    })              

    const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: History,
    config: {
      systemInstruction: `You have to behave like a Data Structure and Algorithm Expert.
    You will be given a context of relevant information and a user question.
    Your task is to answer the user's question based ONLY on the provided context.
    If the answer is not in the context, you must say "I could not find the answer in the provided document."
    Keep your answers clear, concise, and educational.
      
      Context: ${context}
      `,
    },
   });


   History.push({
    role:'model',
    parts:[{text:response.text}]
  })

    res.status(200).json({
        message: response.text
    });
}
catch(err){
       console.error("Error:", err); 
        res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

 export default solveDoubt;

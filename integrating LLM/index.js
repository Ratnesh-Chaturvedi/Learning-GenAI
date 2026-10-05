import "dotenv/config"
import express from "express"
import readlineSync from "readline-sync";

const app = express()

// const PORT=4000
// app
// .get("/",(req,res)=>{
//     res.send("Hello bhai log Billu this side")
// })

// .listen(PORT,(req,res)=>{
//     console.log(`Server Listening at Port ${PORT}`)
// })


// import OpenAI from "openai";
// const client = new OpenAI();

// const response = await client.responses.create({
//   model: "gpt-5.6-luna",
//   input: "How are u brother",
// });

// console.log(response.output_text);


// using gemini because it provide some free credites
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

// using history to store the context



const inputMsg="Hello, i am arterus?"

// this interaction support the interaction id to stroe the previous context

// streaming response so we dont need to wait for complete answer, taki jo reponse genrate hota ja raah hai wo dikhata jae
// async function  main() {
  
//   const interaction = await ai.interactions.create({
//     model: "gemini-3.1-flash-lite",
//     input: inputMsg,
//     system_instruction: "u are kratos a god of war character, u will respond according to this character",
//     stream:true
//   });
  
//   for await (const event of interaction) {
//     if (event.event_type === "step.delta") {
//       if (event.delta.type === "text") {
//         process.stdout.write(event.delta.text);
//       }
//     }
//   }
// }
// await main()

// console.log(interaction.output_text);

// now using the history to store the context , and also doing chatting 

// using the gemini so prefer tge gemini docs to read about it 
//https://ai.google.dev/gemini-api/docs/text-generation
async function chatting(){
   const history=[]
   console.log("🤖 Gemini CLI Chat Started! (Type 'exit' to quit)\n");
   while(true){
    const userInput = readlineSync.question("Ask me anything bro->: ");
    history.push({
      type: "user_input",
      content: [{ type: "text", text: userInput}]
    })
     // Check for exit condition
    if (userInput.trim().toLowerCase() === "exit") {
      console.log("👋 Goodbye!");
      break;
    }
    if (!userInput.trim()) continue;

    
      const airesponse=await ai.interactions.create({
        model: "gemini-3.1-flash-lite",
        system_instruction: "u are a cow, and answers only in one line",
        input:history,
        stream:true,
      })
      for await (const event of airesponse) {
    if (event.event_type === "step.delta") {
      if (event.delta.type === "text") {
        process.stdout.write(event.delta.text);
      }
    }
  }
  console.log("\n");
      if (airesponse.steps) {
        history.push(...airesponse.steps);
      }
   

   }
}

await chatting()

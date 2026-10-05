import "dotenv/config";
import readlineSync from "readline-sync";
import { GoogleGenAI } from "@google/genai";

// attach this to frontend so can see the chat stream on frontend as we see in the chatgpt




const ai=new GoogleGenAI({})

async function chatStream() {
     const history=[]
    console.log("🤖 Gemini CLI Chat Started! (Type 'exit' to quit)\n");
    while(true){
         const userInput = readlineSync.question("Ask me anything bro->: ");
        history.push({
      type: "user_input",
      content: [{ type: "text", text: userInput}]
    })
 if (!userInput.trim()) continue;
    if(userInput==="exit"){
        console.log("Chat Ended")
        break;
    }

        const response=await ai.interactions.create({
            model:"gemini-3.1-flash-lite",
            system_instruction:"Your are a philosper and answer as short as possible instead of exageration",
            input:history,
            stream:true,
            
    })
   
    for await (const event of response) {
        if (event.event_type === "step.delta") {
            if (event.delta.type === "text") {
                
                process.stdout.write(event.delta.text);
            }
        }
    }
    console.log("\n")
    // store the stream response into the text
    if (response.steps) {
        history.push(...response.steps);
      }
}
}

await chatStream();
import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();

// import { GoogleGenerativeAI } from "@google/generative-ai";

// console.log("Testing key:", process.env.GEMINI_API_KEY);

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// console.log("Loaded Gemini Key:", process.env.GEMINI_API_KEY?.length);


// async function test() {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//     const result = await model.generateContent("Hello!");
//     console.log("\nSUCCESS! Your API key works.");
//     console.log("AI Response:", result.response.text());
//   } catch (err) {
//     console.error("\n❌ API Test Failed!");
//     console.error(err.message);
//   }
// }

// test();


// import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

console.log("Loaded Groq Key:", process.env.GROQ_API_KEY?.length);

async function test() {
  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Groq model
      messages: [
        { role: "user", content: "Hello!" }
      ],
      temperature: 0.7,
      max_tokens: 256
    });

    console.log("\n✅ SUCCESS! Groq API works");
    console.log("AI Response:", response.choices[0].message.content);

  } catch (err) {
    console.error("\n❌ Groq API Test Failed");
    console.error(err);
  }
}

test();

import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("Testing key:", process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log("Loaded Gemini Key:", process.env.GEMINI_API_KEY?.length);


async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent("Hello!");
    console.log("\nSUCCESS! Your API key works.");
    console.log("AI Response:", result.response.text());
  } catch (err) {
    console.error("\n❌ API Test Failed!");
    console.error(err.message);
  }
}

test();

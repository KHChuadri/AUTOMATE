import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GenerateMermaidDiagram(transcript: string) {
  try {
    const response = await openai.responses.create({
      model: "gpt-5-nano",
      input: `Generate Mermaid.js code for a diagram from previous prompts (if any), including ${transcript}, and output only the code.`
    });

    console.log(response.output_text);
  } catch (error) {
    console.error(error);
  }
}

export async function StopCurrentSession() {
  try {
    await openai.responses.create({
      model: "gpt-5",
      input: `erase history`
    });

  } catch (error) {
    console.error(error);
  }
}
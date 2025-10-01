import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GenerateMermaidDiagram(transcript: string) {
  try {
    const response = await openai.responses.create({
      model: "gpt-5-nano",
      input: `Generate a valid Mermaid.js code without the language wrapper e.g. \`\`\`mermaid for a diagram from previous prompts (if any), including ${transcript}, and output only the code.`
    });
    console.log(response.output_text);
    return response.output_text;
  } catch (error) {
    console.error(error);
    throw new Error(error);
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
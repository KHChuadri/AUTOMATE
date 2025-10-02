import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GenerateMermaidDiagram(transcript: string, previousDiagram?: string) {
  try {
    let prompt = `Generate a valid Mermaid.js code without the language wrapper e.g. \`\`\`mermaid for a diagram based on this request: ${transcript}`;
    
    if (previousDiagram) {
      prompt += `\n\nPrevious diagram context (modify/extend this if the new request relates to it):\n${previousDiagram}`;
    }
    
    prompt += `\n\nOutput only a valid Mermaid.js code without any wrapper or explanation. Please ensure the diagram is valid and does not have any syntax errors.`;
    console.log(prompt);
    const response = await openai.responses.create({
      model: "gpt-5-nano",
      input: [
        {
            role: "developer",
            content: "Create a valid Mermaid.js code and please test to ensure the diagram is valid and does not have any syntax errors."
        },
        {
            role: "user",
            content: prompt,
        },
    ],
    });
    console.log(response.output_text);
    return response.output_text;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}

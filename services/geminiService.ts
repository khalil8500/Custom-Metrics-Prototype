import { GoogleGenAI, Type } from "@google/genai";
import { Metric, AnalysisResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const resultSchema = {
    type: Type.OBJECT,
    properties: {
        metricName: { type: Type.STRING },
        detected: { type: Type.BOOLEAN },
        justification: { 
            type: Type.STRING,
            description: "A brief explanation for why the metric was detected or not, based on the transcript."
        },
        quote: { 
            type: Type.STRING,
            description: "A direct quote from the transcript that supports the justification. Should be empty if no relevant quote is found."
        },
        value: {
            type: Type.STRING,
            description: "The value of the given metric with the units"
        }
    },
    required: ["metricName", "detected", "justification", "quote"]
};

export const analyzeTranscript = async (
  transcript: string,
  metrics: Metric[]
): Promise<AnalysisResult[]> => {
  const metricDefinitions = metrics.map(m => `- ${m.name}: ${m.description}`).join('\n');

  const prompt = `
    As an expert analyst, your task is to review the following transcript and calucalute the specified metrics.

    TRANSCRIPT:
    ---
    ${transcript}
    ---

    METRICS TO DETECT:
    ---
    ${metricDefinitions}
    ---

    For each metric, you must provide a boolean 'detected' status, a 'justification' for your decision, and a relevant 'quote' from the transcript if one exists.
    Return your findings as a JSON array where each object corresponds to one of the provided metrics.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: resultSchema
        },
      }
    });

    const jsonText = response.text.trim();
    const parsedResult = JSON.parse(jsonText);

    // Ensure the result is an array before returning
    if (Array.isArray(parsedResult)) {
        return parsedResult as AnalysisResult[];
    } else {
        console.error("Gemini API did not return a valid JSON array:", parsedResult);
        throw new Error("The analysis returned an unexpected format. Please try again.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to analyze the transcript. Please check your API key and the provided inputs.");
  }
};

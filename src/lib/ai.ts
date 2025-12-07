import Perplexity from '@perplexity-ai/perplexity_ai';

export async function callAi(prompt: string, systemPrompt: string) {
  const apiKey = import.meta.env.VITE_PPLX_API_KEY;
  
  if (!apiKey) {
    console.error("[AI] Missing API Key");
    throw new Error("Missing API Key. Please set VITE_PPLX_API_KEY in .env.local");
  }

  console.log("[AI] Initializing client with key ending in ...", apiKey.slice(-4));

  try {
    // Initialize the client with the API key
    const client = new Perplexity({ apiKey });

    console.log("[AI] Sending request to Perplexity...");
    const response = await client.chat.completions.create({
      model: "sonar-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
    });

    console.log("[AI] Response received");
    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response received from AI");
    }

    return content;
  } catch (error: any) {
    console.error("[AI] Call Failed:", error);
    throw error;
  }
}
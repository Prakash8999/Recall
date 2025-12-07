export async function callAi(prompt: string, systemPrompt: string) {
  const apiKey = import.meta.env.VITE_PPLX_API_KEY;
  
  if (!apiKey) {
    console.error("[AI] Missing API Key");
    throw new Error("Missing API Key. Please set VITE_PPLX_API_KEY in .env.local");
  }

  console.log("[AI] Sending request to Perplexity...");

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI] API Error:", response.status, errorText);
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("[AI] Response received");
    
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response received from AI");
    }

    return content;
  } catch (error: any) {
    console.error("[AI] Call Failed:", error);
    throw error;
  }
}
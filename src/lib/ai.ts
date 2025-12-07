export async function callAi(prompt: string, systemPrompt: string) {
  const apiKey = import.meta.env.VITE_PPLX_API_KEY;
  
  // If no API key is found, we can't call the real API.
  // We'll throw a specific error that the UI can catch and show to the user.
  if (!apiKey) {
    throw new Error("Missing API Key. Please set VITE_PPLX_API_KEY in .env.local");
  }

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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error?.message || "AI Service Error");
      } catch {
        throw new Error(`AI Service Error: ${response.statusText}`);
      }
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response received from AI");
    }

    return content;
  } catch (error: any) {
    console.error("AI Call Failed:", error);
    throw error;
  }
}

// Configuration: User should set this env var or paste key here
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const callGemini = async (prompt: string, asJson = false) => {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your environment variables.");
  }
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-preview-02-05:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: asJson ? { responseMimeType: "application/json" } : undefined
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error Body:", errorText);
      throw new Error(`Gemini API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return asJson ? JSON.parse(text) : text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
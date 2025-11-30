"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const chat = action({
  args: {
    prompt: v.string(),
    asJson: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const PPLX_API_KEY = process.env.PPLX_API_KEY;
    if (!PPLX_API_KEY) {
      throw new Error("PPLX_API_KEY is not set in environment variables");
    }

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PPLX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: args.prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sonar API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("No content returned from Sonar");
    }

    if (args.asJson) {
      try {
        // Attempt to find JSON object in the text (handling markdown code blocks)
        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonStr = text.substring(jsonStart, jsonEnd + 1);
          return JSON.parse(jsonStr);
        }
        return JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON from AI response:", text);
        throw new Error("Failed to parse JSON from AI response");
      }
    }

    return text;
  },
});

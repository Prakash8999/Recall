"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const sendOtpEmail = action({
  args: { email: v.string(), otp: v.string() },
  handler: async (ctx, args) => {
    try {
      const response = await fetch("https://email.vly.ai/send_otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "vlytothemoon2025",
        },
        body: JSON.stringify({
          to: args.email,
          otp: args.otp,
          appName: "FocusBoard Pro",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send OTP: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      throw new Error("Failed to send OTP email");
    }
  },
});

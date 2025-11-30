import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

export const update = mutation({
  args: {
    name: v.optional(v.string()),
    otpEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.otpEnabled !== undefined) updates.otpEnabled = args.otpEnabled;

    await ctx.db.patch(userId, updates);
  },
});

export const generateAndSendOtp = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user || !user.email) throw new Error("User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await ctx.db.patch(userId, {
      otpSecret: otp,
      otpExpiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
    });

    await ctx.scheduler.runAfter(0, internal.otp.sendOtpEmail, {
      email: user.email,
      otp,
    });
  },
});

export const verifyOtp = mutation({
  args: { otp: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (user.otpSecret !== args.otp || (user.otpExpiresAt && user.otpExpiresAt < Date.now())) {
      throw new Error("Invalid or expired OTP");
    }

    await ctx.db.patch(userId, {
      emailVerificationTime: Date.now(),
      otpSecret: undefined,
      otpExpiresAt: undefined,
    });
  },
});
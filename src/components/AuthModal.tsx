import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Lock, User, ArrowRight, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { signIn, signOut, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [checkVerification, setCheckVerification] = useState(false);

  const generateOtp = useMutation(api.users.generateAndSendOtp);
  const verifyOtp = useMutation(api.users.verifyOtp);

  // Handle post-login verification check
  useEffect(() => {
    const checkUserStatus = async () => {
      if (isAuthenticated && user && checkVerification) {
        setCheckVerification(false);
        
        // If user is not verified OR has OTP enabled, force OTP flow
        if (!user.emailVerificationTime || user.otpEnabled) {
          try {
            await generateOtp();
            setStep("otp");
            setIsLoading(false);
            toast.info("OTP Sent", { description: "Please check your email for the verification code." });
          } catch (err) {
            console.error("Failed to send OTP:", err);
            setError("Failed to send verification code.");
            setIsLoading(false);
          }
        } else {
          // User is verified and OTP is disabled -> Let them in
          onOpenChange(false);
          navigate("/dashboard");
          toast.success("Welcome back!");
          setIsLoading(false);
        }
      }
    };

    checkUserStatus();
  }, [isAuthenticated, user, checkVerification, generateOtp, navigate, onOpenChange]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      // If closed while in OTP step (and not verified), sign out
      if (step === "otp" && user && !user.emailVerificationTime) {
        signOut();
      }
      setStep("credentials");
      setFlow("signIn");
      setError(null);
      setOtpValue("");
      setIsLoading(false);
    }
  }, [open, step, user, signOut]);

  const handleCredentialsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.append("flow", flow);

    try {
      await signIn("password", formData);
      
      if (flow === "signUp") {
        // For sign up, always go to OTP
        // We need to wait for auth state to update, but we can trigger OTP generation
        // However, we need the user ID in context, which requires auth.
        // So we set the flag to check in useEffect
        setCheckVerification(true);
      } else {
        // For sign in, we also check in useEffect
        setCheckVerification(true);
      }
      // Loading state continues until useEffect handles it
    } catch (error) {
      console.error("Sign in error:", error);
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      
      // Make error more user friendly
      if (errorMessage.includes("already in use") || errorMessage.includes("already exists")) {
        setError("This email is already registered. Please sign in instead.");
      } else {
        setError(errorMessage);
      }
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 6) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await verifyOtp({ otp: otpValue });
      toast.success("Verified successfully!");
      onOpenChange(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("OTP error:", error);
      setError("Invalid or expired OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {step === "otp" 
              ? "Verify Your Account" 
              : (flow === "signUp" ? "Create an Account" : "Welcome Back")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === "otp"
              ? "Enter the 6-digit code sent to your email"
              : (flow === "signUp"
                ? "Enter your details to get started"
                : "Enter your email and password to log in")}
          </DialogDescription>
        </DialogHeader>
        
        {step === "credentials" ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4 mt-4">
            <input name="flow" value={flow} type="hidden" />
            
            {flow === "signUp" && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="name"
                  placeholder="Full Name"
                  type="text"
                  className="pl-9"
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                name="email"
                placeholder="name@example.com"
                type="email"
                className="pl-9"
                disabled={isLoading}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                name="password"
                placeholder="Password"
                type="password"
                className="pl-9"
                disabled={isLoading}
                required
                minLength={8}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {flow === "signUp" ? "Sign Up" : "Sign In"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground mt-4">
              {flow === "signUp" ? "Already have an account? " : "Don't have an account? "}
              <button
                type="button"
                className="underline hover:text-primary font-medium"
                onClick={() => {
                  setFlow(flow === "signUp" ? "signIn" : "signUp");
                  setError(null);
                }}
              >
                {flow === "signUp" ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6 mt-4">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={(value) => setOtpValue(value)}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otpValue.length !== 6}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Verify Code
                  <KeyRound className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-primary underline"
                onClick={() => {
                  setStep("credentials");
                  signOut();
                }}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
        
        <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
          Secured by Convex Auth
        </div>
      </DialogContent>
    </Dialog>
  );
}
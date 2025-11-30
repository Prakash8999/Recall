import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail, User, Lock } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirect = redirectAfterAuth || "/";
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirectAfterAuth]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(event.currentTarget);
    formData.append("flow", flow);
    
    try {
      await signIn("password", formData);
      // Redirect is handled by the useEffect above when isAuthenticated becomes true
    } catch (error) {
      console.error("Sign in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Authentication failed. Please check your credentials."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flex items-center justify-center h-full flex-col w-full max-w-[400px]">
          <Card className="w-full pb-0 border shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center">
                <img
                  src="./logo.svg"
                  alt="Logo"
                  width={64}
                  height={64}
                  className="rounded-lg mb-4 mt-4 cursor-pointer"
                  onClick={() => navigate("/")}
                />
              </div>
              <CardTitle className="text-xl">
                {flow === "signUp" ? "Create an Account" : "Welcome Back"}
              </CardTitle>
              <CardDescription>
                {flow === "signUp"
                  ? "Enter your details to get started"
                  : "Enter your email and password to log in"}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <input name="flow" value={flow} type="hidden" />
                
                {flow === "signUp" && (
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
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
                  </div>
                )}

                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
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
                </div>

                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
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
                </div>

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
                
                {error && (
                  <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
                )}

                <div className="text-center text-sm text-muted-foreground mt-2">
                  {flow === "signUp" ? "Already have an account? " : "Don't have an account? "}
                  <button
                    type="button"
                    className="underline hover:text-primary"
                    onClick={() => {
                      setFlow(flow === "signUp" ? "signIn" : "signUp");
                      setError(null);
                    }}
                  >
                    {flow === "signUp" ? "Sign In" : "Sign Up"}
                  </button>
                </div>
                
              </CardContent>
            </form>
            <div className="py-4 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
              Secured by{" "}
              <a
                href="https://convex.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary transition-colors"
              >
                Convex Auth
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
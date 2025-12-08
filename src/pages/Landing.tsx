import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, LayoutDashboard, CheckCircle2, Zap, Shield, Star, Users, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden selection:bg-primary/20">
      {/* Navbar */}
      <nav className="px-4 md:px-6 py-4 flex items-center justify-between border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">FocusBoard</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setIsAuthModalOpen(true)} className="hidden sm:flex">
            Sign In
          </Button>
          <Button onClick={handleGetStarted} className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            Get Started
          </Button>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 px-4 md:px-6 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/5 rounded-full blur-3xl opacity-30" />
          </div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border mb-6 text-sm font-medium text-muted-foreground">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span>v2.0 is now live</span>
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-4xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 text-foreground">
                Master Your <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent animate-gradient bg-300%">
                  Workflow
                </span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-lg md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                The minimalist Kanban board for personal productivity. 
                Limit work in progress, focus on what matters, and get things done.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105" onClick={handleGetStarted}>
                  Start for Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto hover:bg-secondary/50" onClick={() => setIsAuthModalOpen(true)}>
                  View Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Visual Preview */}
            <motion.div 
              initial={{ opacity: 0, y: 60, rotateX: 20 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
              className="mt-20 relative mx-auto max-w-5xl perspective-1000"
            >
              <div className="relative rounded-xl border bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden ring-1 ring-white/10 dark:ring-white/5">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
                <div className="p-2 md:p-4 grid grid-cols-1 md:grid-cols-3 gap-4 opacity-90">
                  {/* Mock UI Columns */}
                  <div className="hidden md:flex flex-col gap-3 p-3 rounded-lg bg-secondary/20 border border-border/50">
                    <div className="h-6 w-24 bg-muted rounded-md" />
                    <div className="h-24 w-full bg-card rounded-md border shadow-sm" />
                    <div className="h-24 w-full bg-card rounded-md border shadow-sm" />
                  </div>
                  <div className="flex flex-col gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <div className="flex justify-between">
                      <div className="h-6 w-24 bg-blue-500/20 rounded-md" />
                      <div className="h-6 w-6 bg-blue-500/20 rounded-full" />
                    </div>
                    <div className="h-32 w-full bg-card rounded-md border border-blue-200 dark:border-blue-900 shadow-sm p-3 space-y-2">
                      <div className="h-4 w-3/4 bg-foreground/10 rounded" />
                      <div className="h-3 w-full bg-muted rounded" />
                      <div className="h-3 w-1/2 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                    <div className="h-6 w-24 bg-green-500/20 rounded-md" />
                    <div className="h-24 w-full bg-card rounded-md border border-green-200 dark:border-green-900 shadow-sm opacity-60" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-secondary/30 relative">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Everything you need</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Powerful features to help you manage your tasks without the clutter.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Zap className="w-6 h-6 text-yellow-500" />}
                title="Focus Mode"
                description="Strict WIP limits prevent overwhelm. Only 2 tasks in progress at a time to ensure you finish what you start."
              />
              <FeatureCard 
                icon={<BarChart3 className="w-6 h-6 text-indigo-500" />}
                title="Visual Progress"
                description="Get that dopamine hit when you drag a task to Done. Track your wins and see your productivity soar."
              />
              <FeatureCard 
                icon={<Shield className="w-6 h-6 text-blue-500" />}
                title="Blocker Management"
                description="Track what's blocking you. Add reasons, get AI tips to unblock, and clear the path to success."
              />
              <FeatureCard 
                icon={<Users className="w-6 h-6 text-purple-500" />}
                title="Personal Board"
                description="Your private space. No distractions, no noise. Just you and your tasks."
              />
              <FeatureCard 
                icon={<CheckCircle2 className="w-6 h-6 text-green-500" />}
                title="AI Powered"
                description="Let AI break down complex tasks, write descriptions, and help you get unstuck."
              />
              <FeatureCard 
                icon={<LayoutDashboard className="w-6 h-6 text-pink-500" />}
                title="Modern Interface"
                description="A beautiful, responsive interface that works on all your devices. Dark mode included."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto bg-primary text-primary-foreground rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Ready to get focused?</h2>
              <p className="text-primary-foreground/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                Join thousands of users who are mastering their workflow with FocusBoard.
              </p>
              <Button size="lg" variant="secondary" className="h-14 px-8 text-lg rounded-full shadow-xl hover:scale-105 transition-transform" onClick={handleGetStarted}>
                Get Started Now
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t bg-card">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg">FocusBoard</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FocusBoard. Built with Convex & React.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
      
      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      <div className="mb-6 bg-secondary/50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
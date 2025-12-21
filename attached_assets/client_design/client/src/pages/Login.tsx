import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Lock, Loader2, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [, setLocation] = useLocation();
  const { login, register, isLoginPending, isRegisterPending } = useAuth();
  const { toast } = useToast();

  const isLoading = isLoginPending || isRegisterPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isRegisterMode) {
        await register({ username, password, email: email || undefined });
        toast({
          title: "Account created!",
          description: "Welcome to UniTools. You're now logged in.",
        });
      } else {
        await login({ username, password });
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      }
      setLocation("/");
    } catch (error: any) {
      toast({
        title: isRegisterMode ? "Registration failed" : "Login failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
         <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link href="/">
          <a className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors" data-testid="link-back-home">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </a>
        </Link>

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2" data-testid="text-page-title">
              {isRegisterMode ? "Create an account" : "Welcome back"}
            </h1>
            <p className="text-slate-500 text-sm" data-testid="text-page-subtitle">
              {isRegisterMode 
                ? "Join UniTools to unlock premium features" 
                : "Enter your credentials to access your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="johndoe" 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  data-testid="input-username"
                />
              </div>
            </div>

            {isRegisterMode && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email (Optional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
               <div className="flex items-center justify-between">
                 <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Password</label>
                 {!isRegisterMode && <a href="#" className="text-xs text-primary font-medium hover:underline">Forgot?</a>}
               </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password"
                />
              </div>
            </div>

            <Button 
              className="w-full h-11 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 text-base" 
              disabled={isLoading}
              type="submit"
              data-testid="button-submit"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegisterMode ? "Create Account" : "Sign In")}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            {isRegisterMode ? (
              <>
                Already have an account?{" "}
                <button 
                  onClick={() => setIsRegisterMode(false)} 
                  className="font-semibold text-primary hover:underline"
                  data-testid="button-switch-login"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button 
                  onClick={() => setIsRegisterMode(true)} 
                  className="font-semibold text-primary hover:underline"
                  data-testid="button-switch-register"
                >
                  Sign up for free
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

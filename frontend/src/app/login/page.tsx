"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";

const demoUsers = [
  { name: "Januja Ramachandran", email: "nchahal@example.org", profession: "Business Analyst", city: "Delhi" },
  { name: "Nisha Krishna", email: "tanveersuri@example.com", profession: "Lawyer", city: "Kolkata" },
  { name: "Dhriti Luthra", email: "siya70@example.net", profession: "Teacher", city: "Hyderabad" },
  { name: "Aditya Oommen", email: "okhosla@example.com", profession: "Marketing Manager", city: "Kolkata" },
  { name: "Jeremiah Mishra", email: "irana@example.com", profession: "Lawyer", city: "Mumbai" },
  { name: "Rachit Grewal", email: "tamble@example.net", profession: "Teacher", city: "Hyderabad" },
  { name: "Wahab Nanda", email: "buchekiya@example.com", profession: "Teacher", city: "Chennai" },
  { name: "Urmi Choudhry", email: "kabir45@example.net", profession: "Business Analyst", city: "Hyderabad" },
  { name: "Saumya Khurana", email: "yashodhara22@example.org", profession: "Architect", city: "Mumbai" },
  { name: "Neel Bath", email: "hsheth@example.com", profession: "Student", city: "Mumbai" },
  { name: "Upma Dora", email: "sridharnidra@example.net", profession: "Student", city: "Pune" },
  { name: "Aarav Thaker", email: "tanishbajaj@example.org", profession: "Student", city: "Bangalore" },
  { name: "Champak Sharma", email: "ysodhi@example.net", profession: "Architect", city: "Mumbai" },
  { name: "Elijah Parekh", email: "vkrishna@example.org", profession: "Doctor", city: "Chennai" },
  { name: "Barkha Arora", email: "watika48@example.com", profession: "AI Engineer", city: "Hyderabad" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("LifeOS@2026");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await login(email, password);
      // router.push is handled in auth-context
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side: Animated branding */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-zinc-950 p-12 lg:flex">
        {/* Subtle animated background shapes */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-[100px]"
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-600/20 blur-[100px]"
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-8 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-4 shadow-2xl shadow-violet-500/20">
            <Brain className="h-16 w-16 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            LifeOS <span className="text-violet-400">AI</span>
          </h1>
          <p className="max-w-md text-lg text-zinc-400">
            Your autonomous intelligence platform for personal finance and productivity.
          </p>

          <div className="mt-12 grid gap-6 text-left sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur">
              <h3 className="font-semibold text-zinc-200">ML Predictions</h3>
              <p className="mt-1 text-sm text-zinc-500">Forecasting & anomaly detection</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur">
              <h3 className="font-semibold text-zinc-200">AI Agents</h3>
              <p className="mt-1 text-sm text-zinc-500">Automated financial insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex w-full flex-col justify-center px-8 sm:px-12 lg:w-1/2 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <div className="mb-6 flex justify-center lg:hidden">
              <div className="rounded-xl bg-violet-600 p-3">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to access your personalized LifeOS dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Demo Access
              </span>
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 text-sm">
            <p className="font-medium text-violet-500">Demo Accounts ({demoUsers.length} available)</p>
            <p className="mt-1 text-muted-foreground">
              Click any user below to autofill their credentials. Password: <code className="rounded bg-muted px-1">LifeOS@2026</code>
            </p>
            <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
              {demoUsers.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => handleDemoLogin(user.email)}
                  className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-xs transition-all hover:border-violet-500/40 hover:bg-violet-500/10 ${
                    email === user.email
                      ? "border-violet-500 bg-violet-500/10 text-violet-500"
                      : "border-zinc-800 text-muted-foreground"
                  }`}
                >
                  <div>
                    <span className="font-medium text-foreground">{user.name}</span>
                    <span className="ml-2 text-muted-foreground">{user.profession}, {user.city}</span>
                  </div>
                  <ArrowRight className="h-3 w-3 shrink-0 text-violet-500 opacity-0 transition-opacity group-hover:opacity-100" style={{ opacity: email === user.email ? 1 : undefined }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

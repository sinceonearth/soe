"use client";

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff, createLucideIcon } from "lucide-react";
import { faceAlien } from "@lucide/lab";
import { z } from "zod";

import { loginUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, setAuthToken } from "@/lib/queryClient";

const FaceAlien = createLucideIcon("FaceAlien", faceAlien);
type LoginUser = z.infer<typeof loginUserSchema>;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginUser) => {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result.message || "Login failed");
      }
      return res.json();
    },
    onSuccess: async (data) => {
      if (data.token) {
        setAuthToken(data.token); // save token
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] }); // refresh user
      }

      toast({
        title: "Welcome back 👽",
        description: "Successfully signed in to SinceOnEarth!",
      });

      // ✅ Redirect directly to dashboard
      setLocation("/dashboard");
    },
    onError: (err: any) => {
      const msg = err?.message || "Invalid email or password";
      setError(msg);
      toast({
        title: "Login failed 🚫",
        description: msg,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden items-center justify-center p-12"
        >
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
          <div className="relative z-10 max-w-lg">
            <div className="relative mb-8">
              <div className="absolute inset-0 blur-3xl opacity-50 bg-green-600" />
              <FaceAlien className="h-32 w-32 text-green-500 animate-pulse relative z-10" />
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Continue tracking your adventures across the globe and watch your travel story unfold.
            </p>
          </div>
        </motion.div>

        {/* Right Side */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="w-full lg:w-1/2 min-h-screen flex items-center justify-center px-4 lg:p-12"
        >
          <div className="w-full max-w-md space-y-6">
            {/* Headings */}
            <div className="text-center lg:text-left mb-6 space-y-2">
              <h1 className="text-2xl lg:text-3xl font-semibold text-white">
                Welcome to SinceOnEarth
              </h1>
              <p className="text-sm text-gray-400">
                Log in to explore your journeys across the world 🌍
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={form.handleSubmit((data) =>
                loginMutation.mutate({
                  email: data.email.trim(),
                  password: data.password,
                })
              )}
              className="space-y-4"
            >
              <Input
                id="email"
                type="text"
                placeholder="Email or Username"
                {...form.register("email")}
                className="w-full h-14 bg-black text-white border border-white focus:border-green-500 focus:ring focus:ring-green-600"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...form.register("password")}
                  className="w-full h-14 bg-black text-white border border-white focus:border-green-500 focus:ring focus:ring-green-600 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}

              {error && (
                <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-2 rounded">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-14 bg-white hover:bg-gray-100 text-green-600 border-2 border-green-600 font-semibold text-base rounded-full"
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link href="/register" className="text-green-500 hover:text-green-400 font-semibold">
                Sign up
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

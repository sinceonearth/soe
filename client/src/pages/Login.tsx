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
      if (data.token) setAuthToken(data.token);
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome back 👽",
        description: "Successfully signed in to SinceOnEarth!",
      });
      setTimeout(() => setLocation("/"), 800);
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
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white font-sans"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className="w-[320px] max-w-md space-y-6">
        {/* Alien Logo */}
        <div className="flex flex-col items-center mb-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl opacity-50 bg-green-600" />
            <FaceAlien className="h-24 w-24 text-green-600 animate-pulse relative z-10" />
          </div>
        </div>

        {/* Headings */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-2xl font-semibold text-white">
            welcome to ...sinceonearth
          </h1>
          <p className="text-xs text-white">
            Log in to explore your journeys across the world 🌍
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={form.handleSubmit((data) =>
            loginMutation.mutate({
              email: data.email.trim().toLowerCase(),
              password: data.password,
            })
          )}
          className="space-y-4"
        >
          {/* Email */}
          <Input
            id="email"
            type="email"
            placeholder="Email"
            autoCapitalize="none"
            autoCorrect="off"
            className="w-full h-14 bg-black text-white border border-white focus:border-green-500 focus:ring focus:ring-green-600"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.email.message}
            </p>
          )}

          {/* Password */}
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoCapitalize="none"
              className="w-full h-14 bg-black text-white border border-white focus:border-green-500 focus:ring focus:ring-green-600 pr-12"
              {...form.register("password")}
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

          {/* Error message */}
          {error && (
            <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-2 rounded">
              {error}
            </div>
          )}

          {/* Submit */}
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

        {/* Register link */}
        <div className="text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-green-500 hover:text-green-400 font-semibold">
            Sign up
          </Link>
        </div>

        {/* Created by footer */}
        <div className="text-center mt-6">
          <div className="inline-block px-6 py-2 bg-neutral-900 border-2 border-green-600 rounded-full">
            <p className="text-xs text-gray-400">
              created by व्रज पटेल
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

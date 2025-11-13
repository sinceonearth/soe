"use client";

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff, createLucideIcon } from "lucide-react";
import { faceAlien } from "@lucide/lab";

import { registerUserSchema, type RegisterUser } from "@shared/schema";
import { apiRequest, queryClient, setAuthToken } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Alien icon component
const FaceAlien = createLucideIcon("FaceAlien", faceAlien);

const countries = [
  "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "China",
  "Denmark", "Egypt", "Finland", "France", "Germany", "Greece", "Hungary",
  "Iceland", "India", "Indonesia", "Ireland", "Israel", "Italy", "Japan",
  "Kenya", "Luxembourg", "Malaysia", "Mexico", "Morocco", "Netherlands",
  "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru", "Philippines",
  "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia",
  "Singapore", "South Africa", "South Korea", "Spain", "Sweden", "Switzerland",
  "Thailand", "Turkey", "UAE", "UK", "USA", "Vietnam"
].sort();

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPendingApproval, setShowPendingApproval] = useState(false);

  const form = useForm<RegisterUser>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      country: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterUser) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Registration failed");
      return result;
    },
    onSuccess: async (result) => {
      if (result.requiresApproval) {
        setShowPendingApproval(true);
      } else {
        // User registered with invite code - redirect to dashboard
        if (result.token) {
          setAuthToken(result.token);
        }
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        toast({ title: "Welcome!", description: `Welcome to SinceOnEarth, ${result.user.username}! 👽` });
        setTimeout(() => setLocation("/"), 800);
      }
    },
    onError: (err: any) => {
      setError(err.message || "Registration failed");
    },
  });

  const onSubmit = (data: RegisterUser) => {
    setError("");
    registerMutation.mutate(data);
  };

  // Show pending approval page
  if (showPendingApproval) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white font-sans"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-md text-center space-y-6">
          <FaceAlien className="h-32 w-32 text-green-600 mx-auto animate-pulse" />
          <h1 className="text-3xl font-bold text-green-400">Account Created!</h1>
          <div className="bg-neutral-900 border border-gray-700 rounded-xl p-6 space-y-3">
            <p className="text-gray-300 text-lg">
              Your account is pending admin approval.
            </p>
            <p className="text-gray-400 text-sm">
              You'll receive access once an administrator reviews your registration.
              Please check back later.
            </p>
          </div>
          <Button
            onClick={() => setLocation("/login")}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-full"
          >
            Back to Login
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Branding & Effects (Desktop Only) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden items-center justify-center p-12"
        >
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

          {/* Content */}
          <div className="relative z-10 max-w-lg">
            <div className="relative mb-8">
              <div className="absolute inset-0 blur-3xl opacity-50 bg-green-600" />
              <FaceAlien className="h-32 w-32 text-green-500 animate-pulse relative z-10" />
            </div>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
              Start Your Journey
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Join thousands of travelers mapping their adventures and collecting memories from around the world.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Free Forever - No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Beautiful 3D Globe View</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Track Every Flight & Destination</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Available on iOS & Web</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Register Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="w-full lg:w-1/2 min-h-screen flex items-center justify-center px-4 lg:p-12"
        >
          <div className="w-full max-w-md space-y-6">
            {/* Mobile Logo */}
            <div className="flex flex-col items-center mb-4 lg:hidden">
              <div className="relative">
                <div className="absolute inset-0 blur-2xl opacity-50 bg-green-600" />
                <FaceAlien className="h-24 w-24 text-green-600 animate-pulse relative z-10" />
              </div>
            </div>

            {/* Headings */}
            <div className="text-center lg:text-left mb-6 space-y-2">
              <h1 className="text-2xl lg:text-3xl font-semibold text-white">
                Join SinceOnEarth
              </h1>
              <p className="text-sm text-gray-400">
                Create your account to explore the galaxy 🌍
              </p>
            </div>

        {/* Register Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input
            placeholder="Full name"
            className="w-full h-14 bg-black text-white border border-white focus:border-green-500 focus:ring focus:ring-green-600"
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
          )}

          <Input
            placeholder="Username"
            className="w-full h-14 bg-black text-white border border-white focus:border-green-500 focus:ring focus:ring-green-600"
            {...form.register("username")}
          />
          {form.formState.errors.username && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.username.message}</p>
          )}

          <Input
            type="email"
            placeholder="Email"
            className="w-full h-14 bg-black text-white border border-white focus:border-green-500 focus:ring focus:ring-green-600"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
          )}

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
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
            <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>
          )}

          <select
            className="w-full h-14 bg-black text-white border border-white focus:border-green-500 focus:ring focus:ring-green-600 rounded px-3"
            {...form.register("country")}
          >
            <option value="">Select your country</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {form.formState.errors.country && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.country.message}</p>
          )}

          <Input
            placeholder="Invite code (optional)"
            className="w-full h-14 bg-black text-white border border-white focus:border-green-500 focus:ring focus:ring-green-600"
            {...form.register("inviteCode")}
          />

          {error && (
            <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full h-14 bg-white hover:bg-gray-100 text-green-600 border-2 border-green-600 font-semibold text-base rounded-full"
          >
            {registerMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                Signing up...
              </span>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-green-500 hover:text-green-400 font-semibold">
            Log in
          </Link>
        </div>

        {/* Created by footer */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-6 py-3 rounded-full">
            <span className="text-sm text-gray-400">Created by</span>
            <span className="text-sm font-semibold text-green-400">व्रज पटेल</span>
          </div>
        </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

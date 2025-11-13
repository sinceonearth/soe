"use client";

import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import {
  Globe,
  Plane,
  MapPin,
  BarChart3,
  Trophy,
  Earth,
  Map,
  ArrowRight,
  Check,
  Sparkles,
  createLucideIcon,
} from "lucide-react";
import { faceAlien } from "@lucide/lab";

const FaceAlienIcon = createLucideIcon("FaceAlienIcon", faceAlien);

interface Stats {
  totalFlights: number;
  totalCountries: number;
  totalUsers: number;
  userRating: number;
}

export default function CompanyPage() {
  const [, navigate] = useLocation();
  const [stats, setStats] = useState<Stats>({
    totalFlights: 0,
    totalCountries: 0,
    totalUsers: 0,
    userRating: 4.9,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/public/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstallButton(false);
    }

    setDeferredPrompt(null);
  };

  const features = [
    {
      icon: Earth,
      value: "180+",
      label: "Countries",
      description:
        "Track every country you visit and watch your passport fill up",
      color: "text-purple-400",
      bgColor: "from-purple-500/10 to-purple-500/5",
    },
    {
      icon: Plane,
      value: "50K+",
      label: "Flights",
      description: "Log all your flights with detailed routes and travel times",
      color: "text-green-400",
      bgColor: "from-green-500/10 to-green-500/5",
    },
    {
      icon: MapPin,
      value: "1000+",
      label: "Places",
      description: "Record your stays and create a complete travel timeline",
      color: "text-pink-400",
      bgColor: "from-pink-500/10 to-pink-500/5",
    },
    {
      icon: BarChart3,
      value: "Real-time",
      label: "Analytics",
      description: "See your travel stats - distance, hours, and achievements",
      color: "text-yellow-400",
      bgColor: "from-yellow-500/10 to-yellow-500/5",
    },
    {
      icon: Trophy,
      value: "Achievements",
      label: "Unlockable",
      description: "Collect country stamps and unlock travel milestones",
      color: "text-orange-400",
      bgColor: "from-orange-500/10 to-orange-500/5",
    },
    {
      icon: Globe,
      value: "3D",
      label: "Globe View",
      description: "Visualize your journeys on an interactive 3D world map",
      color: "text-indigo-400",
      bgColor: "from-indigo-500/10 to-indigo-500/5",
    },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
    return num.toString();
  };

  const displayStats = [
    { value: formatNumber(stats.totalFlights), label: "Flights Tracked" },
    { value: `${stats.totalCountries}+`, label: "Countries" },
    { value: formatNumber(stats.totalUsers), label: "Travelers" },
    { value: `${stats.userRating}★`, label: "User Rating" },
  ];

  return (
    <div className="min-h-screen w-full bg-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          {/* App Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 blur-3xl opacity-50 bg-green-600" />
              <FaceAlienIcon className="h-24 w-24 text-green-500 animate-pulse relative z-10 mx-auto" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">
              Track Your Adventures Across The Globe
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight"
          >
            Your Travel Story,
            <br />
            <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
              Beautifully Mapped
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Log every flight, track accommodations, and visualize your journeys
            on an interactive globe. Watch your travel achievements grow as you
            explore the world.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate("/register")}
              className="group px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-black text-lg font-semibold rounded-full hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-all duration-300 flex items-center gap-2 hover:scale-105"
            >
              Start Tracking Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-white/5 border border-white/10 text-white text-lg font-semibold rounded-full hover:bg-white/10 transition-all duration-300"
            >
              Sign In
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`group p-6 bg-gradient-to-br ${feature.bgColor} backdrop-blur-sm border-2 border-white/10 rounded-2xl hover:border-green-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <feature.icon
                    className={`w-12 h-12 ${feature.color} group-hover:scale-110 transition-transform duration-300`}
                  />
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {feature.value}
                    </div>
                    <div className="text-sm text-gray-400 font-medium">
                      {feature.label}
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-green-600/10 border border-green-500/20 rounded-3xl p-12 md:p-16"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />

            <div className="relative z-10 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Start Your
                <br />
                <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                  Travel Journey?
                </span>
              </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Join thousands of travelers mapping their adventures around the
                world
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <button
                  onClick={() => navigate("/register")}
                  className="group px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-black text-lg font-semibold rounded-full hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-all duration-300 flex items-center gap-2 hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {showInstallButton && (
                  <button
                    onClick={handleInstallClick}
                    className="px-8 py-4 bg-white/5 border border-green-500/30 text-green-400 text-lg font-semibold rounded-full hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                  >
                    <Globe className="w-5 h-5" />
                    Add to Home Screen
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Get Early Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Available on iOS</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          {/* Created By Badge */}
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-6 py-3 rounded-full">
            <span className="text-sm text-gray-400">Created by</span>
            <span className="text-sm font-semibold text-green-400">
              व्रज पटेल
            </span>
          </div>

          {/* Footer Links */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
            <div className="text-gray-500 text-sm">
              © 2025 Since On Earth. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <button onClick={() => navigate("/privacy")} className="hover:text-green-400 transition-colors">
                Privacy
              </button>
              <button onClick={() => navigate("/terms")} className="hover:text-green-400 transition-colors">
                Terms
              </button>
              <button onClick={() => navigate("/contact")} className="hover:text-green-400 transition-colors">
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

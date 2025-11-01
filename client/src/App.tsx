"use client";

import { useState, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { SplashScreen } from "@/components/SplashScreen";
import { useAuth } from "@/hooks/useAuth";

// Pages
import GetStarted from "@/pages/GetStarted";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Achievements from "@/pages/Achievements";
import TripsPageWrapper from "@/pages/TripsPageWrapper";
import StayInsPageWrapper from "@/pages/StayInsPageWrapper";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

/* ===============================
   🚏 ROUTER HANDLER
   =============================== */
function Router({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <Switch>
      {!isAuthenticated && (
        <>
          <Route path="/" component={GetStarted} />
          <Route path="/get-started" component={GetStarted} />
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
        </>
      )}
      {isAuthenticated && (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/achievements" component={Achievements} />
          <Route path="/trips" component={TripsPageWrapper} />
          <Route path="/stayins" component={StayInsPageWrapper} />
          <Route path="/admin" component={Admin} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

/* ===============================
   ⚙️ MAIN APP CONTENT
   =============================== */
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // ⏳ While checking session
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Checking session...
      </div>
    );
  }

  // 🧭 Logged-out view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Router isAuthenticated={false} />
      </div>
    );
  }

  // 🧑‍🚀 Authenticated view
  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="flex flex-col items-center w-full">
        <Router isAuthenticated={true} />
      </main>
      <FooterNav />
    </div>
  );
}

/* ===============================
   🚀 ROOT APP COMPONENT
   =============================== */
export default function App() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <ToastProvider>
            <AnimatePresence mode="wait">
              {showSplash ? (
                <motion.div
                  key="splash"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <SplashScreen onComplete={() => setShowSplash(false)} />
                </motion.div>
              ) : (
                <motion.div
                  key="app"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <AppContent />
                </motion.div>
              )}
            </AnimatePresence>
            <ToastViewport />
          </ToastProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

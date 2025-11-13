"use client";

import { useState, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FooterNav } from "@/components/FooterNav";
import { useAuth } from "@/hooks/useAuth";
import { createLucideIcon } from "lucide-react";
import { faceAlien } from "@lucide/lab";
import Header from "@/components/Header";

// Alien Icon
const AlienIcon = createLucideIcon("AlienIcon", faceAlien);

// Pages
import GetStarted from "@/pages/GetStarted";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Achievements from "@/pages/Achievements";
import Radr from "@/pages/Radr";
import TravelOverview from "@/pages/TravelOverview";
import Admin from "@/pages/Admin";
import Account from "@/pages/Account";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";
import TripHistory from "./pages/TripHistory";
import StayIns from "./pages/StayIns";

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
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/contact" component={Contact} />
        </>
      )}

      {isAuthenticated && (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/achievements" component={Achievements} />
          <Route path="/radr" component={Radr} />
          <Route path="/trips" component={TripHistory} />
          <Route path="/stayins" component={StayIns} />
          <Route path="/travel" component={TravelOverview} />
          <Route path="/admin" component={Admin} />
          <Route path="/account" component={Account} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/contact" component={Contact} />
        </>
      )}

      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [mounted, setMounted] = useState(false);

  // ✅ Prevent header blink on web/Capacitor
  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <AlienIcon className="w-24 h-24 text-green-500 animate-pulse" />
      </div>
    );
  }

  // ✅ Show header only when mounted and on authenticated pages (not login/register/start)
  const showHeader =
    mounted &&
    isAuthenticated &&
    !["/", "/get-started", "/login", "/register"].includes(location);

  return (
    <div className="min-h-screen bg-background pb-20">
      {showHeader && <Header />}

      <main className="flex flex-col w-full">
        <Router isAuthenticated={!!isAuthenticated} />
      </main>

      {isAuthenticated && <FooterNav />}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <ToastProvider>
            <AppContent />
            <ToastViewport />
          </ToastProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

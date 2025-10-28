"use client";

import { useState, useEffect } from "react";
import { ChevronDown, LogOut, BarChart3, Plane, Building2, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export function MenuBar() {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: "/dashboard", icon: BarChart3 },
    { path: "/trips", icon: Plane },
    { path: "/stayins", icon: Building2 },
  ];

  if (user?.is_admin) {
    menuItems.push({ path: "/admin", icon: Shield });
  }

  // Find the current page icon
  const currentPage = menuItems.find((item) => 
    location === item.path || (item.path === "/dashboard" && location === "/")
  ) || menuItems[0];
  
  const CurrentIcon = currentPage.icon;

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 h-10 px-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 text-white"
      >
        <CurrentIcon className="h-5 w-5" />
        <ChevronDown className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="fixed right-4 top-20 z-50 bg-black/40 backdrop-blur-2xl border border-green-400/30 rounded-full shadow-2xl shadow-green-500/20 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col p-3 gap-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path || (item.path === "/dashboard" && location === "/");
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`flex items-center justify-center p-3 rounded-full transition-all duration-200 ${
                        isActive
                          ? "bg-green-500/30 text-white ring-2 ring-green-400/50 shadow-lg shadow-green-500/30"
                          : "text-neutral-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })}
                <div className="h-px bg-green-400/20 mx-2" />
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center p-3 rounded-full text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

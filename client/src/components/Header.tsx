"use client";

import { Icon, Satellite } from "lucide-react";
import { faceAlien } from "@lucide/lab";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export const Header = () => {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [topInset, setTopInset] = useState(0);
  const [mounted, setMounted] = useState(false); // ✅ Only render after hydration

  const isRadrOpen = location === "/radr";

  const toggleRadr = () => navigate(isRadrOpen ? "/dashboard" : "/radr");

  // Detect safe-area inset (notch) and mount header
  useEffect(() => {
    const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (isIos) {
      const div = document.createElement("div");
      div.style.position = "absolute";
      div.style.top = "env(safe-area-inset-top)";
      document.body.appendChild(div);

      const computed = parseInt(getComputedStyle(div).top || "0", 10);
      setTopInset(computed);

      document.body.removeChild(div);
    }

    setMounted(true); // ✅ Header now renders only after hydration
  }, []);

  if (!mounted) return null; // Prevent blink on web

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-md"
      style={{ paddingTop: topInset }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          {/* Alien icon */}
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300">
            <Icon iconNode={faceAlien} className="h-6 w-6 text-white" />
          </button>

          {/* User badge */}
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center"
          >
            <div className="px-4 py-1.5 rounded-full bg-white/20 text-white font-semibold text-sm shadow-sm flex items-center gap-1.5">
              <span>alien #{user?.alien ?? "—"}</span>
            </div>
          </motion.div>
        </div>

        {/* Satellite icon */}
        <button
          onClick={toggleRadr}
          className="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300"
        >
          <Satellite
            className="h-9 w-9"
            style={{ stroke: isRadrOpen ? "#22c55e" : "#ffffff" }}
          />
        </button>
      </div>
    </header>
  );
};

export default Header;

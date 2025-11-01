"use client";

import { Icon, LogOut } from "lucide-react";
import { faceAlien } from "@lucide/lab";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-gradient-to-r from-green-500 via-green-600 to-green-500 shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300">
              <Icon iconNode={faceAlien} className="h-6 w-6 text-white" />
            </div>
          </Link>

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

        <button
          onClick={logout}
          className="flex items-center justify-center p-2.5 rounded-full bg-white/20 hover:bg-red-500/30 text-white hover:text-red-200 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

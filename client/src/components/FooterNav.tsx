"use client";

import React from "react";
import { Icon, Plane, Building2, Shield, Award } from "lucide-react";
import { faceAlien } from "@lucide/lab";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

const AlienIcon = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <Icon
    iconNode={faceAlien}
    className={className}
    style={{
      ...style,
      fill: "none",
      background: "transparent",
    }}
  />
);

export function FooterNav() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();

  const menuItems = [
    { path: "/dashboard", icon: AlienIcon },
    { path: "/achievements", icon: Award },
    { path: "/trips", icon: Plane },
    { path: "/stayins", icon: Building2 },
  ];

  if (user?.is_admin) {
    menuItems.push({ path: "/admin", icon: Shield });
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50">
      <div
        className="
          flex justify-center items-center gap-4
          px-6 py-4
          bg-white/5 backdrop-blur-xl border-t border-white/10
          shadow-[0_-2px_20px_rgba(0,0,0,0.2)]
        "
      >
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive =
            location === item.path ||
            (item.path === "/dashboard" && location === "/");

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center justify-center transition-all duration-300 p-2.5
                ${isActive ? "scale-110 text-[#22c55e]" : "text-white/60 hover:text-white"}
              `}
              style={{
                background: "transparent",
                borderRadius: 70, // removed rounded hover
                boxShadow: isActive
                  ? "0 0 7px rgba(34,197,94,0.4)"
                  : "none",
              }}
            >
              <IconComponent
                className="h-8 w-8"
                style={{
                  strokeWidth: 2.0,
                  fill: "none",
                  background: "transparent",
                }}
              />
            </button>
          );
        })}
      </div>
    </footer>
  );
}

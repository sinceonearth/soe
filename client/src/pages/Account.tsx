"use client";

import { useState } from "react";
import { Icon } from "lucide-react";
import { faceAlien } from "@lucide/lab";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { z } from "zod";
import {
  User as UserIcon,
  Mail,
  Key,
  LogOut,
  Shield,
  FileText,
  ExternalLink,
  Send,
} from "lucide-react";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";

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

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  country: z.string(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const contactFormSchema = z.object({
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;
type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
type ContactForm = z.infer<typeof contactFormSchema>;

export default function Account() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState<"profile" | "password" | "support">("profile");

  // Forms
  const profileForm = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
      country: user?.country || "Other",
    },
  });

  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const contactForm = useForm<ContactForm>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileForm) => {
      const res = await apiRequest("PATCH", "/api/auth/profile", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile updated ✅",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Update failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordForm) => {
      const res = await apiRequest("PATCH", "/api/auth/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to change password");
      }
      return res.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Password changed ✅",
        description: "Your password has been changed successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Password change failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const sendSupportMessageMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.name || "User",
          email: user?.email || "",
          subject: data.subject,
          message: data.message,
        }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      contactForm.reset();
      toast({
        title: "Message sent ✅",
        description: "Your message has been sent. We'll get back to you soon!",
      });
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/auth/account");
      if (!res.ok) throw new Error("Failed to delete account");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      logout();
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Failed to delete account",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "See you next time! 👋",
    });
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col relative px-4 md:px-14 pb-16 pt-1 overflow-x-hidden">
      <Header />

      <div className="w-full flex flex-col pt-24 pb-12">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#22c55e] drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] text-center mb-8"
        >
          Account Settings
        </motion.h1>

        {/* User Card */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/30 rounded-xl p-6 mb-8 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full flex items-center justify-center">
              <Icon iconNode={faceAlien} className="h-12 w-12 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
              <p className="text-green-400">@{user?.username} · Alien #{user?.alien}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

{/* Tabs + Logout */}
<div className="w-full flex flex-wrap items-center justify-center md:justify-between gap-3 mb-4">
  <div className="flex flex-wrap justify-center md:justify-start gap-3 w-full md:w-auto">
    {["profile", "password", "support"].map((tab) => {
      const labels = { profile: "Profile", password: "Security", support: "Support" };
      const icons = { profile: UserIcon, password: Key, support: Mail };
      const Icon = icons[tab as keyof typeof icons];
      return (
        <button
          key={tab}
          onClick={() => setActiveSection(tab as any)}
          className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all ${
            activeSection === tab
              ? "bg-green-500 text-black"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Icon size={16} />
          {labels[tab as keyof typeof labels]}
        </button>
      );
    })}
  </div>

<div className="border-b border-gray-600/40 mb-0" />
 {/* Logout Button */}
  <Button
    onClick={handleLogout}
    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full transition-all flex items-center gap-2 border-0 w-full md:w-auto mt-3 md:mt-0"
  >
    <LogOut className="h-4 w-4" /> Log Out
  </Button>
</div>

         <div className="border-b border-gray-600/40 my-6" />

        {/* Profile Section */}
        {activeSection === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full"
          >
            <div className="bg-neutral-900 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-green-400 mb-4">Edit Profile</h3>
              <form
                onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Full Name</label>
                  <Input {...profileForm.register("name")} className="bg-black border-gray-700 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Username</label>
                  <Input {...profileForm.register("username")} className="bg-black border-gray-700 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email</label>
                  <Input {...profileForm.register("email")} type="email" className="bg-black border-gray-700 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Country</label>
                  <select {...profileForm.register("country")} className="w-full h-10 bg-black border border-gray-700 text-white rounded-md px-3">
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="w-full py-2 bg-green-500 hover:bg-green-600 border-green-600 text-black font-semibold rounded-full">
                  Save Changes
                </Button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Password Section */}
        {activeSection === "password" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full"
          >
            <div className="bg-neutral-900 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-green-400 mb-4">Change Password</h3>
              <form
                onSubmit={passwordForm.handleSubmit((data) => changePasswordMutation.mutate(data))}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Current Password</label>
                  <Input {...passwordForm.register("currentPassword")} type="password" className="bg-black border-gray-700 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">New Password</label>
                  <Input {...passwordForm.register("newPassword")} type="password" className="bg-black border-gray-700 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Confirm New Password</label>
                  <Input {...passwordForm.register("confirmPassword")} type="password" className="bg-black border-gray-700 text-white" />
                </div>
                <Button type="submit" className="w-full py-2 bg-green-500 hover:bg-green-600  border-green-600 text-black font-semibold rounded-full">
                  Change Password
                </Button>
              </form>
            </div>
          </motion.div>
        )}

        
{/* Support Section */}
{activeSection === "support" && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6 w-full"
  >
    {/* Contact Support Form */}
    <div className="bg-neutral-900 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold text-green-400 mb-4">Send us a message</h3>
      <form
        onSubmit={contactForm.handleSubmit((data) => sendSupportMessageMutation.mutate(data))}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm text-gray-300 mb-1">Subject</label>
          <Input
            {...contactForm.register("subject")}
            placeholder="What can we help you with?"
            className="bg-black border-gray-700 text-white"
          />
          {contactForm.formState.errors.subject && (
            <p className="text-red-400 text-xs mt-1">{contactForm.formState.errors.subject.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Message</label>
          <textarea
            {...contactForm.register("message")}
            placeholder="Please describe your issue or question..."
            className="w-full h-32 bg-black border border-gray-700 text-white rounded-md px-3 py-2 resize-none focus:border-green-500 focus:outline-none"
          />
          {contactForm.formState.errors.message && (
            <p className="text-red-400 text-xs mt-1">{contactForm.formState.errors.message.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={sendSupportMessageMutation.isPending}
          className="w-full py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-full border-0"
        >
          <Send className="w-4 h-4 mr-2 inline" />
          {sendSupportMessageMutation.isPending ? "Sending..." : "Send Message"}
        </Button>
      </form>
      <p className="text-sm text-gray-500 mt-4 text-center">
        Or email us directly at{" "}
        <a href="mailto:support@sinceonearth.com" className="text-green-400 hover:underline">
          support@sinceonearth.com
        </a>
      </p>
    </div>

    {/* Delete Account Section */}
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h3>
      <p className="text-gray-300 mb-4">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>
      <Button
        onClick={() => {
          if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            deleteAccountMutation.mutate();
          }
        }}
        disabled={deleteAccountMutation.isPending}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full border-0"
      >
        {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
      </Button>
    </div>

    {/* Quick Links / Resources */}
    <div className="bg-neutral-900 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold text-green-400 mb-4">Resources</h3>
      <div className="space-y-3">
        <button
          onClick={() => navigate("/privacy")}
          className="w-full flex items-center justify-between p-3 bg-black hover:bg-white/5 border border-gray-700 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-400" />
            <span className="text-white">Privacy Policy</span>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-400" />
        </button>

        <button
          onClick={() => navigate("/terms")}
          className="w-full flex items-center justify-between p-3 bg-black hover:bg-white/5 border border-gray-700 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-green-400" />
            <span className="text-white">Terms of Service</span>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
  </motion.div>
)}



        </div>
      </div>
  );
}

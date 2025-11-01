"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Ticket, 
  Users, 
  UserCheck, 
  Copy, 
  Check, 
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Header } from "@/components/Header";

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  alien: string | null;
  approved: boolean;
  invite_code_used: string | null;
  created_at: string;
}

interface InviteCode {
  id: string;
  code: string;
  created_by: string;
  created_by_username: string;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface CodeUser {
  id: string;
  username: string;
  name: string;
  email: string;
  created_at: string;
}

export default function Admin() {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [maxUses, setMaxUses] = useState("1");
  const [expiryDays, setExpiryDays] = useState("");
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [codeUsers, setCodeUsers] = useState<Record<string, CodeUser[]>>({});
  const [selectedTab, setSelectedTab] = useState<string>("pending");

  const { data: pendingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/pending-users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/pending-users");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: inviteCodes } = useQuery<InviteCode[]>({
    queryKey: ["/api/admin/invite-codes"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/invite-codes");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: allUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      const body: any = { maxUses: parseInt(maxUses) || 1 };
      if (expiryDays) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + parseInt(expiryDays));
        body.expiresAt = expiry.toISOString();
      }
      const res = await apiRequest("POST", "/api/admin/invite-codes", body);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invite-codes"] });
      toast({ title: "Code created", description: data.code });
      setMaxUses("1");
      setExpiryDays("");
    },
  });

  const approveUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("POST", `/api/admin/approve-user/${userId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User approved" });
    },
  });

  const rejectUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/reject-user/${userId}`);
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User rejected" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/reject-user/${userId}`);
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deleted" });
    },
  });

  const deactivateCodeMutation = useMutation({
    mutationFn: async (codeId: string) => {
      const res = await apiRequest("PATCH", `/api/admin/invite-codes/${codeId}/deactivate`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invite-codes"] });
      toast({ title: "Code deactivated" });
    },
  });

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleCodeUsers = async (code: string) => {
    if (expandedCode === code) {
      setExpandedCode(null);
    } else {
      setExpandedCode(code);
      if (!codeUsers[code]) {
        const res = await apiRequest("GET", `/api/admin/invite-codes/${code}/users`);
        if (res.ok) {
          const users = await res.json();
          setCodeUsers(prev => ({ ...prev, [code]: users }));
        }
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col relative px-4 md:px-14 pb-16 pt-1 overflow-x-hidden">
      <Header />

<div className="w-full bg-black text-white flex flex-col pt-24 pb-12 overflow-x-hidden">
  {/* Title */}
  <motion.h1
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#22c55e] drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] text-center mb-8"
  >
    Admin Dashboard
  </motion.h1>

        

        {/* Tabs */}
        <div className="w-full overflow-x-auto scrollbar-hide mb-2">
          <div className="flex gap-7 py-4">
            <button
              onClick={() => setSelectedTab("pending")}
              className={`px-4 py-2 transition-all whitespace-nowrap text-sm ${
                "pending" === selectedTab
                  ? "bg-green-500 text-black rounded-full font-semibold"
                  : "text-gray-400 hover:text-white rounded-full"
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCheck size={16} />
                Pending ({pendingUsers?.length || 0})
              </div>
            </button>
            <button
              onClick={() => setSelectedTab("invites")}
              className={`px-4 py-2 transition-all whitespace-nowrap text-sm ${
                "invites" === selectedTab
                  ? "bg-green-500 text-black rounded-full font-semibold"
                  : "text-gray-400 hover:text-white rounded-full"
              }`}
            >
              <div className="flex items-center gap-2">
                <Ticket size={16} />
                Codes
              </div>
            </button>
            <button
              onClick={() => setSelectedTab("users")}
              className={`px-4 py-2 transition-all whitespace-nowrap text-sm ${
                "users" === selectedTab
                  ? "bg-green-500 text-black rounded-full font-semibold"
                  : "text-gray-400 hover:text-white rounded-full"
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={16} />
                Users
              </div>
            </button>
          </div>
        </div>

         <div className="border-b border-gray-600/40 my-6" />

        {/* Pending Users */}
        {selectedTab === "pending" && (
          <div className="w-full">
            <div className="text-green-400 text-xl font-semibold mb-3">
              Pending Approvals
            </div>
            {!pendingUsers?.length ? (
              <div className="text-gray-400">No pending users</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 bg-neutral-900 border border-gray-700 rounded-xl hover:shadow-lg transition-shadow"
                  >
                    <div className="mb-3 min-w-0">
                      <div className="font-semibold text-base text-white truncate">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-300 truncate">
                        @{user.username}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {user.email}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => approveUserMutation.mutate(user.id)}
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-xs h-8"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => rejectUserMutation.mutate(user.id)}
                        size="sm"
                        variant="destructive"
                        className="flex-1 text-xs h-8"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Invite Codes */}
        {selectedTab === "invites" && (
          <div className="w-full">
            <div className="mb-6">
              <button
                onClick={() => {
                  const uses = prompt("Max uses (default 1):", "1");
                  const days = prompt("Expires in days (leave empty for no expiry):", "");
                  if (uses) {
                    setMaxUses(uses);
                    setExpiryDays(days || "");
                    generateCodeMutation.mutate();
                  }
                }}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-full transition-all flex items-center gap-2 text-sm"
              >
                <Plus size={18} />
                Generate Code
              </button>
            </div>

            <div className="text-green-400 text-xl font-semibold mb-3">
              Invite Codes
            </div>

            {!inviteCodes?.length ? (
              <div className="text-gray-400">No invite codes</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {inviteCodes.map((code) => {
                  const isExpired = code.expires_at && new Date(code.expires_at) < new Date();
                  const isFullyUsed = code.current_uses >= code.max_uses;
                  const isActive = code.is_active && !isExpired && !isFullyUsed;

                  return (
                    <div
                      key={code.id}
                      className={`p-4 border rounded-xl hover:shadow-lg transition-shadow min-w-0 ${
                        isActive
                          ? "bg-neutral-900 border-green-700"
                          : "bg-neutral-900/50 border-gray-700 opacity-60"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <code className="text-base font-mono font-bold text-green-400 bg-black px-2 py-1 rounded truncate">
                          {code.code}
                        </code>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => copyToClipboard(code.code)}
                            className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                          >
                            {copiedCode === code.code ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                          {isActive && (
                            <button
                              onClick={() => {
                                if (confirm(`Deactivate ${code.code}?`)) {
                                  deactivateCodeMutation.mutate(code.id);
                                }
                              }}
                              className="p-1 rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 text-xs text-gray-400 mb-2">
                        <span className="truncate">Uses: <span className="text-white font-semibold">{code.current_uses}/{code.max_uses}</span></span>
                        <span className="truncate">By: <span className="text-white">@{code.created_by_username}</span></span>
                      </div>

                      <div className="flex justify-between items-center text-xs gap-2">
                        <span className="text-gray-400 truncate">
                          {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : "No expiry"}
                        </span>
                        <Badge className={`flex-shrink-0 ${isActive ? "bg-green-600" : "bg-gray-700"}`}>
                          {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
                        </Badge>
                      </div>

                      {code.current_uses > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <button
                            onClick={() => toggleCodeUsers(code.code)}
                            className="text-green-400 text-xs hover:text-green-300 flex items-center gap-1"
                          >
                            {expandedCode === code.code ? (
                              <>
                                <ChevronUp className="h-3 w-3" />
                                Hide users
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3" />
                                Show {code.current_uses} user{code.current_uses > 1 ? "s" : ""}
                              </>
                            )}
                          </button>

                          {expandedCode === code.code && codeUsers[code.code] && (
                            <div className="mt-2 space-y-1.5">
                              {codeUsers[code.code].map((user) => (
                                <div key={user.id} className="bg-black rounded p-2 text-xs min-w-0">
                                  <p className="text-white font-medium truncate">{user.name}</p>
                                  <p className="text-green-400 truncate">@{user.username}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* All Users */}
        {selectedTab === "users" && (
          <div className="w-full">
            <div className="text-green-400 text-xl font-semibold mb-3">
              All Users
            </div>
            {!allUsers?.length ? (
              <div className="text-gray-400">No users</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {allUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 bg-neutral-900 border border-gray-700 rounded-xl hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between gap-3 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-base text-white truncate">
                            {user.name}
                          </span>
                          {user.approved ? (
                            <Badge className="bg-green-600 text-white text-xs flex-shrink-0">✓</Badge>
                          ) : (
                            <Badge className="bg-yellow-600 text-xs flex-shrink-0">Pending</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-300 truncate">
                          @{user.username}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {user.email}
                        </div>
                        {user.invite_code_used && (
                          <div className="text-xs text-emerald-500 font-mono mt-1 truncate">
                            {user.invite_code_used}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between items-end gap-2 flex-shrink-0">
                        <span className="text-gray-400 text-xs">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                        <Button
                          onClick={() => {
                            if (confirm(`Delete ${user.name}?`)) {
                              deleteUserMutation.mutate(user.id);
                            }
                          }}
                          size="sm"
                          variant="destructive"
                          className="h-7 w-7 p-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

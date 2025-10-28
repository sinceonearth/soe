"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import StayIns from "@/pages/StayIns";
import { apiRequest } from "@/lib/queryClient";

export default function StayInsPageWrapper() {
  const { token, user } = useAuth();

  const { data: stayins = [], refetch } = useQuery<any[]>({
    queryKey: ["user-stayins", token],
    enabled: !!token,
    queryFn: async () => {
      if (!token) return [];
      const res = await apiRequest("GET", "/api/stayins", null, token);
      if (!res.ok) throw new Error("Failed to fetch stay ins");
      return res.json();
    },
  });

  if (!user) return null;

  return (
    <div className="min-h-screen w-screen bg-black text-white flex flex-col">
      <Header />
      <div className="flex-1 overflow-y-auto pt-20 px-4">
        <StayIns stayins={stayins} userId={user.id} onRefresh={refetch} />
      </div>
    </div>
  );
}

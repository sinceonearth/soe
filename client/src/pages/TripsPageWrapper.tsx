"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import TripHistory from "@/pages/TripHistory";
import { apiRequest } from "@/lib/queryClient";
import type { Flight } from "@shared/schema";

export default function TripsPageWrapper() {
  const { token, user } = useAuth();

  const { data: flights = [], refetch } = useQuery<Flight[]>({
    queryKey: ["user-flights", token],
    enabled: !!token,
    queryFn: async () => {
      if (!token) return [];
      const res = await apiRequest("GET", "/api/flights", null, token);
      if (!res.ok) throw new Error("Failed to fetch flights");
      return res.json();
    },
  });

  if (!user) return null;

  return (
    <div className="min-h-screen w-screen bg-black text-white flex flex-col">
      <Header />
      <div className="flex-1 overflow-y-auto pt-20 px-4">
        <TripHistory flights={flights} userId={user.id} onRefresh={refetch} />
      </div>
    </div>
  );
}

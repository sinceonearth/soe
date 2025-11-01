"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { apiRequest } from "@/lib/queryClient";
import type { Flight } from "@shared/schema";
import airportsDataRaw from "@/airports.json";
import { motion } from "framer-motion";

interface AirportJSON {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  iso_country: string;
  latitude: number;
  longitude: number;
}

const airportsData: AirportJSON[] = airportsDataRaw as AirportJSON[];

interface Stamp {
  id: string;
  name: string;
  isoCode: string;
  travelDate?: string;
}

// Flag emoji helper
const getFlagEmoji = (countryCode: string) =>
  countryCode.toUpperCase().replace(/./g, (char) =>
    String.fromCodePoint(127397 + char.charCodeAt(0))
  );

const getCountryFromLatLon = (lat: number, lon: number) => {
  const tolerance = 0.01;
  const airport = airportsData.find(
    (a) =>
      Math.abs(a.latitude - lat) < tolerance &&
      Math.abs(a.longitude - lon) < tolerance
  );
  return airport?.iso_country || null;
};

export default function Achievements() {
  const { token } = useAuth();

  const { data: flights = [] } = useQuery<Flight[]>({
    queryKey: ["user-flights", token],
    enabled: !!token,
    queryFn: async () => {
      if (!token) return [];
      const res = await apiRequest("GET", "/api/flights", null, token);
      if (!res.ok) throw new Error("Failed to fetch flights");
      return res.json();
    },
  });

  const allStamps: Stamp[] = useMemo(() => {
    const countryVisits = new Map<string, string>();

    for (const f of flights) {
      const flightDate = f.date || f.departure_time?.split("T")[0];

      if (f.arrival_latitude && f.arrival_longitude) {
        const c = getCountryFromLatLon(f.arrival_latitude, f.arrival_longitude);
        if (c) {
          const code = c.toLowerCase();
          if (!countryVisits.has(code) || (flightDate && flightDate < (countryVisits.get(code) || ""))) {
            countryVisits.set(code, flightDate || "");
          }
        }
      }
    }

    return Array.from(countryVisits.entries()).map(([code, date], i) => ({
      id: `${i + 1}`,
      name: code.toUpperCase(),
      isoCode: code,
      travelDate: date,
    }));
  }, [flights]);

  // Random row pattern for floating capsules
  const rows: Stamp[][] = useMemo(() => {
    const result: Stamp[][] = [];
    const stamps = [...allStamps];
    const rowPattern = [3, 2, 5, 4, 6]; // variable row sizes
    let i = 0;
    while (stamps.length) {
      const count = rowPattern[i % rowPattern.length];
      result.push(stamps.splice(0, count));
      i++;
    }
    return result;
  }, [allStamps]);

  const getRotation = () => Math.random() * 8 - 4; // small rotation
  const getYOffset = () => Math.random() * 4 - 2;  // small vertical offset

  return (
  <>
    <Header />
    <div className="relative min-h-screen bg-black text-white pt-24 pb-24 overflow-x-hidden flex flex-col gap-1 px-2 sm:px-4">
      {/* Green glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#22c55e]/10 blur-[120px] rounded-full pointer-events-none" />

       {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#22c55e] drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] text-center mb-8"
        >
          Achievements
        </motion.h1>

      

      {allStamps.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/60 text-lg text-center mt-10"
        >
          No journeys yet — start exploring ✈️
        </motion.p>
      ) : (
        <div className="flex flex-col gap-4 w-full max-w-[1600px] mx-auto">
          {rows.map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              className="flex justify-center gap-4 sm:gap-5 flex-wrap px-1"
            >
              {row.map((stamp) => (
                <motion.div
                  key={stamp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: getYOffset(),
                    rotate: getRotation(),
                  }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-5 py-3 hover:border-[#22c55e]/60 hover:shadow-[0_0_15px_rgba(34,197,94,0.25)] transition-all min-w-[140px]"
                >
                  <span className="text-3xl">{getFlagEmoji(stamp.isoCode)}</span>
                  <div className="flex flex-col">
                    <span className="text-lg md:text-xl font-medium text-white tracking-wide">
                      {stamp.name}
                    </span>
                    <span className="text-sm text-white/60">
                      {stamp.travelDate || "Unknown date"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  </>
);
}
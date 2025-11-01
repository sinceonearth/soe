"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { Flight } from "@shared/schema";
import { Ruler, Clock, Plus, ArrowLeft } from "lucide-react";
import ManualAddFlight from "@/components/ManualAddFlight";
import { motion } from "framer-motion";

interface TripHistoryProps {
  flights: Flight[];
  userId: string;
  onRefresh?: () => void;
}

const PAGE_SIZE = 12;

// Calculate actual flight distance in km (with multiplier for air corridors)
const getDistance = (
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null,
  storedDistance?: number | null
): number | null => {
  if (storedDistance != null && storedDistance > 0) return storedDistance;
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;

  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1.15; // 1.15x correction for real path
};

const formatDuration = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

export default function TripHistory({ flights, userId, onRefresh }: TripHistoryProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPastTab, setSelectedPastTab] = useState<string>("All");
  const [visiblePastCount, setVisiblePastCount] = useState(PAGE_SIZE);
  const [visibleUpcomingCount, setVisibleUpcomingCount] = useState(PAGE_SIZE);

  const handleFlightAdded = () => {
    setShowAddForm(false);
    onRefresh?.();
  };

  const [upcomingFlightsState, setUpcomingFlightsState] = useState<Flight[]>([]);
  const [pastFlightsState, setPastFlightsState] = useState<Flight[]>([]);
  const now = new Date();

  const safeParseDate = (dateStr?: string | null): Date | null => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  // Separate upcoming & past flights
  useEffect(() => {
    const upcoming: Flight[] = [];
    const past: Flight[] = [];
    flights.forEach((f) => {
      const d = safeParseDate(f.date ?? f.departure_time);
      if (!d) return;
      d > now ? upcoming.push(f) : past.push(f);
    });
    setUpcomingFlightsState(upcoming);
    setPastFlightsState(past);
  }, [flights]);

  // Auto move to past
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newlyPast: Flight[] = [];
      const stillUpcoming: Flight[] = [];

      upcomingFlightsState.forEach((f) => {
        const d = safeParseDate(f.date ?? f.departure_time);
        if (d && d <= now) newlyPast.push({ ...f, status: "Landed" });
        else stillUpcoming.push(f);
      });

      if (newlyPast.length > 0) {
        setPastFlightsState((prev) => [...prev, ...newlyPast]);
        setUpcomingFlightsState(stillUpcoming);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [upcomingFlightsState]);

  // Past tabs by year
  const years = useMemo(() => {
    const setYears = new Set<number>();
    pastFlightsState.forEach((f) => {
      const d = safeParseDate(f.date ?? f.departure_time);
      if (d) setYears.add(d.getFullYear());
    });
    return [...setYears].sort((a, b) => b - a);
  }, [pastFlightsState]);

  const pastTabs = ["All", ...years.map(String)];

  const pastToShow = useMemo(() => {
    if (selectedPastTab === "All") return pastFlightsState;
    const year = Number(selectedPastTab);
    return pastFlightsState.filter((f) => {
      const d = safeParseDate(f.date ?? f.departure_time);
      return d && d.getFullYear() === year;
    });
  }, [pastFlightsState, selectedPastTab]);

  const handleLoadMorePast = () => setVisiblePastCount((c) => c + PAGE_SIZE);
  const handleLoadMoreUpcoming = () => setVisibleUpcomingCount((c) => c + PAGE_SIZE);

  const FlightCard = ({
    f,
    showStatus,
    isUpcoming,
  }: {
    f: Flight;
    showStatus?: boolean;
    isUpcoming?: boolean;
  }) => {
    const d = safeParseDate(f.date ?? f.departure_time);
    const dateStr = d ? d.toLocaleDateString() : "N/A";
    const statusColor = isUpcoming ? "bg-green-500 text-black" : "bg-red-600 text-white";

    const distanceKm = getDistance(
      f.departure_latitude,
      f.departure_longitude,
      f.arrival_latitude,
      f.arrival_longitude,
      f.distance
    );

    let durationHours: number | null = null;
    if (f.duration) {
      const durationStr = String(f.duration);
      const hours = durationStr.match(/(\d+)h/);
      const mins = durationStr.match(/(\d+)m/);
      durationHours =
        (hours ? parseInt(hours[1]) : 0) + (mins ? parseInt(mins[1]) / 60 : 0);
    } else if (distanceKm != null) {
      durationHours = distanceKm / 850 + 0.5;
    }

    return (
      <div className="p-4 bg-neutral-900 border border-gray-700 rounded-xl hover:shadow-lg transition-shadow flex justify-between">
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-lg text-white">
            {f.airline_name || "Unknown Airline"} {f.flight_number || "N/A"}
          </div>
          <div className="text-sm text-gray-300">
            {f.departure || "???"} → {f.arrival || "???"}
          </div>
          <div className="flex gap-2 mt-1 text-xs text-gray-400">
            {distanceKm && (
              <span className="flex items-center gap-1">
                <Ruler size={12} /> {distanceKm.toFixed(1)} km
              </span>
            )}
            {durationHours && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> {formatDuration(durationHours)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end text-sm gap-1">
          <span className="text-gray-300">{dateStr}</span>
          {showStatus && f.status && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${statusColor}`}
            >
              {isUpcoming && (
                <span className="w-2 h-2 rounded-full animate-pulse bg-white" />
              )}
              {f.status}
            </span>
          )}
        </div>
      </div>
    );
  };

  if (showAddForm) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex flex-col relative px-4 md:px-8 py-6">
        <button
          onClick={() => setShowAddForm(false)}
          className="flex items-center gap-2 text-white hover:text-green-400 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Back to Trips</span>
        </button>
        <ManualAddFlight userId={userId} onSuccess={handleFlightAdded} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col relative px-4 md:px-8 pb-12 pt-4 overflow-x-hidden">

      {/* Animated Gradient Header */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#22c55e] drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] text-center mb-10 inline-block"
      >
        Trips History
      </motion.h1>

      {/* Add Flight */}
      <div className="mb-6 flex justify-center md:justify-start">
        <button
          onClick={() => setShowAddForm(true)}
          className="px-6 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-full transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Add Flight
        </button>
      </div>

         <div className="border-b border-gray-600/40 my-6" />
         
      {/* Upcoming Flights */}
      <div className="mb-6">
        <div className="text-green-400 text-xl font-semibold mb-3">Upcoming Flights</div>
        {upcomingFlightsState.length === 0 ? (
          <div className="text-gray-400 text-center">No upcoming flights</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingFlightsState.slice(0, visibleUpcomingCount).map((f) => (
                <FlightCard key={f.id} f={f} showStatus isUpcoming />
              ))}
            </div>
            {visibleUpcomingCount < upcomingFlightsState.length && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleLoadMoreUpcoming}
                  className="px-6 py-2 rounded-full bg-green-500 hover:bg-green-600 text-black font-semibold"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="border-b border-gray-600/40 my-6" />

      {/* Past Flights */}
      <div>
        <div className="text-red-400 text-xl font-semibold mb-3">Past Flights</div>

        {/* Tabs */}
        {pastTabs.length > 0 && (
          <div className="w-full overflow-x-auto scrollbar-hide relative bg-black my-0">
            <div className="flex gap-1 py-2 min-w-[max-content] pl-1 pr-4">
              {pastTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setSelectedPastTab(tab);
                    setVisiblePastCount(PAGE_SIZE);
                  }}
                  className={`px-5 py-2 transition-all whitespace-nowrap focus:outline-none ${
                    tab === selectedPastTab
                      ? "bg-red-500 text-black font-semibold rounded-full"
                      : "text-red-400 hover:text-red-300 bg-transparent"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-b border-gray-600/40 my-3" />

        <div className="text-red-400 font-medium mb-4">
          ✈️ Total flights: {pastToShow.length}
        </div>

        {pastToShow.length === 0 ? (
          <div className="text-center text-gray-400 mt-4">
            No flights for {selectedPastTab}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastToShow.slice(0, visiblePastCount).map((f) => (
                <FlightCard key={f.id} f={f} showStatus />
              ))}
            </div>
            {visiblePastCount < pastToShow.length && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleLoadMorePast}
                  className="px-6 py-2 rounded-full bg-red-500 hover:bg-red-600 text-black font-semibold"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

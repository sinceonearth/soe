"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Globe, Plane, Ruler, Building2, TowerControl, Clock, MapPin } from "lucide-react";
import type { Flight } from "@shared/schema";

// Import airports.json
import airportsDataRaw from "@/airports.json";

interface AirportJSON {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  iso_country: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  timezone?: string;
  dst?: string;
  tz?: string;
}

const airportsData: AirportJSON[] = airportsDataRaw as AirportJSON[];

interface StatsDashboardProps {
  totalFlights: number;
  totalStayins: number;
  flights: Flight[];
  stayins: any[];
}

// Helper: get country from flight lat/lon via airports.json
const getCountryFromLatLon = (lat: number, lon: number) => {
  const tolerance = 0.01; // ~1 km tolerance
  const airport = airportsData.find(
    (a) => Math.abs(a.latitude - lat) < tolerance && Math.abs(a.longitude - lon) < tolerance
  );
  return airport?.iso_country || null;
};

export function StatsDashboard({ totalFlights, totalStayins, flights, stayins }: StatsDashboardProps) {
  // Compute stats
  const { uniqueCountries, uniquePlaces, totalDistance, totalHours, uniqueAirportCodes } = useMemo(() => {
    const countrySet = new Set<string>();
    const placeSet = new Set<string>();
    const airportSet = new Set<string>();

    let distanceSum = 0;
    let hoursSum = 0;

    for (const f of flights) {
      // departure
      if (f.departure_latitude && f.departure_longitude) {
        const c = getCountryFromLatLon(f.departure_latitude, f.departure_longitude);
        if (c) countrySet.add(c.toUpperCase());
      }

      // arrival
      if (f.arrival_latitude && f.arrival_longitude) {
        const c = getCountryFromLatLon(f.arrival_latitude, f.arrival_longitude);
        if (c) countrySet.add(c.toUpperCase());
      }

      // airport codes
      if (f.departure) airportSet.add(f.departure.toUpperCase());
      if (f.arrival) airportSet.add(f.arrival.toUpperCase());

      // distance & hours
      if (f.departure_latitude && f.departure_longitude && f.arrival_latitude && f.arrival_longitude) {
        // Use stored distance if available, otherwise calculate
        let dist = 0;
        if (f.distance && f.distance > 0) {
          dist = f.distance;
        } else {
          // Haversine formula for great circle distance
          const R = 6371; // Earth radius in km
          const dLat = ((f.arrival_latitude - f.departure_latitude) * Math.PI) / 180;
          const dLon = ((f.arrival_longitude - f.departure_longitude) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((f.departure_latitude * Math.PI) / 180) *
            Math.cos((f.arrival_latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const greatCircleDist = R * c;
          
          // Apply 1.15x multiplier for actual flight path (air corridors, weather routing, etc.)
          dist = greatCircleDist * 1.15;
        }
        
        distanceSum += dist;
        
        // Calculate duration from stored value or estimate
        if (f.duration) {
          // Parse duration string (e.g., "2h 30m" or "150" minutes)
          const durationStr = String(f.duration);
          if (durationStr.includes('h') || durationStr.includes('m')) {
            const hours = durationStr.match(/(\d+)h/);
            const mins = durationStr.match(/(\d+)m/);
            const totalHours = (hours ? parseInt(hours[1]) : 0) + (mins ? parseInt(mins[1]) / 60 : 0);
            hoursSum += totalHours;
          } else {
            // Assume it's in minutes
            hoursSum += parseFloat(durationStr) / 60;
          }
        } else {
          // Estimate: actual flight time = distance / 850 km/h (cruise) + 30min for taxi/climb/descent
          hoursSum += (dist / 850) + 0.5;
        }
      }
    }

    // Count unique places from stayins
    for (const s of stayins) {
      if (s.name) {
        placeSet.add(s.name);
      }
    }

    return {
      uniqueCountries: countrySet,
      uniquePlaces: placeSet,
      totalDistance: distanceSum.toFixed(0),
      totalHours: hoursSum.toFixed(1),
      uniqueAirportCodes: airportSet,
    };
  }, [flights, stayins]);

  const formatNumber = (num: number | string) =>
    isNaN(Number(num)) ? num : new Intl.NumberFormat("en-IN").format(Number(num));

  const labelClass = "text-xs sm:text-sm opacity-80 font-medium leading-none";

const StatCard = ({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: any;
  value: string | number;
  label: string;
  color: string;
}) => (
  <div className="flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-green-500/10 to-black/40 backdrop-blur-sm px-6 py-3 rounded-full text-white shadow-lg border-2 border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:shadow-green-500/20">
    <div className="flex items-center gap-3">
      <Icon className={`h-9 w-9 ${color}`} />
      <div className="flex flex-col items-start">
        <span className="text-2xl sm:text-3xl font-bold">{value}</span>
        <span className={labelClass}>{label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()}</span>
      </div>
    </div>
  </div>
);

  return (
    <div className="flex flex-col items-center w-full mb-6 gap-2 px-4 sm:px-1 select-none">
      <div className="flex flex-wrap justify-center gap-4 w-full max-w-4xl">
        <div className="flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-green-500/10 to-black/40 backdrop-blur-sm px-6 py-3 rounded-full text-white shadow-lg border-2 border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:shadow-green-500/20">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Ruler className="h-9 w-9 text-yellow-400" />
              <div className="flex flex-col items-start">
                <span className="text-2xl sm:text-3xl font-bold">{formatNumber(totalDistance)}</span>
                <span className={labelClass}>Km's in Distance</span>
              </div>
            </div>
            <div className="h-12 w-px bg-white/20"></div>
            <div className="flex items-center gap-3">
              <Clock className="h-9 w-9 text-orange-400" />
              <div className="flex flex-col items-start">
                <span className="text-2xl sm:text-3xl font-bold">{formatNumber(totalHours)}</span>
                <span className={labelClass}>Hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-4 w-full max-w-5xl mt-1">
        <StatCard icon={Globe} value={uniqueCountries.size} label="Countries" color="text-purple-400" />
        <StatCard icon={MapPin} value={uniquePlaces.size} label="Places" color="text-pink-400" />
      </div>
      <div className="flex flex-wrap justify-center gap-4 w-full max-w-5xl mt-1">
        <StatCard icon={Plane} value={formatNumber(totalFlights)} label="Flights" color="text-green-400" />
        <StatCard icon={TowerControl} value={uniqueAirportCodes.size} label="Airports" color="text-indigo-400" />
        <StatCard icon={Building2} value={formatNumber(totalStayins)} label="Stay Ins" color="text-sky-400" />
      </div>
      <div className="relative w-full max-w-4xl h-[8px] rounded-full overflow-hidden mt-5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.3, ease: "easeOut" }}
          className="absolute top-0 left-0 h-full w-full"
          style={{
            background: "linear-gradient(to right, #a855f7, #22c55e, #eab308, #6366f1, #38bdf8)",
          }}
        />
      </div>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import type { Stayin } from "@shared/schema";
import { Building2, MapPin, Calendar, ArrowLeft, Plus } from "lucide-react";
import AddStayInForm from "@/components/AddStayInForm";

interface StayInsProps {
  stayins: Stayin[];
  userId: string;
  onRefresh?: () => void;
}

const PAGE_SIZE = 12;

export default function StayIns({ stayins, userId, onRefresh }: StayInsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const handleStayInAdded = () => {
    setShowAddForm(false);
    if (onRefresh) onRefresh();
  };

  const safeParseDate = (dateStr?: string | null): Date | null => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  // Get unique years from check-in dates
  const years = useMemo(() => {
    const yearSet = new Set<number>();
    stayins.forEach((s) => {
      const d = safeParseDate(s.check_in);
      if (d) yearSet.add(d.getFullYear());
    });
    return [...yearSet].sort((a, b) => b - a);
  }, [stayins]);

  const tabs = ["All", ...years.map(String)];

  // Filter by selected year
  const filteredStayins = useMemo(() => {
    if (selectedYear === "All") return stayins;
    const year = Number(selectedYear);
    return stayins.filter((s) => {
      const d = safeParseDate(s.check_in);
      return d !== null && d.getFullYear() === year;
    });
  }, [stayins, selectedYear]);

  const handleLoadMore = () => setVisibleCount((c) => c + PAGE_SIZE);

  // Calculate nights stayed
  const calculateNights = (checkIn: string, checkOut: string): number => {
    const d1 = safeParseDate(checkIn);
    const d2 = safeParseDate(checkOut);
    if (!d1 || !d2) return 0;
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const StayCard = ({ stayin }: { stayin: Stayin }) => {
    const checkInDate = safeParseDate(stayin.check_in);
    const checkOutDate = safeParseDate(stayin.check_out);
    const nights = calculateNights(stayin.check_in, stayin.check_out);

    const typeColors: Record<string, string> = {
      HOTEL: "bg-blue-500/20 text-blue-400 border-blue-500/40",
      AIRBNB: "bg-pink-500/20 text-pink-400 border-pink-500/40",
      HOSTEL: "bg-green-500/20 text-green-400 border-green-500/40",
      MOTEL: "bg-purple-500/20 text-purple-400 border-purple-500/40",
    };

    const typeClass = typeColors[stayin.type] || typeColors.HOTEL;

    return (
      <div className="p-4 bg-neutral-900 border border-gray-700 rounded-xl hover:shadow-lg transition-shadow">
        <div className="flex flex-col gap-2">
          {/* Name and Type */}
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold text-lg text-white flex-1">{stayin.name}</div>
            <span className={`px-2 py-1 rounded-full text-xs border ${typeClass}`}>
              {stayin.type}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <MapPin size={14} className="text-gray-400" />
            <span>
              {stayin.city && `${stayin.city}, `}
              {stayin.country}
            </span>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <Calendar size={12} />
            <span>
              {checkInDate?.toLocaleDateString()} → {checkOutDate?.toLocaleDateString()}
            </span>
            {nights > 0 && <span className="text-green-400">({nights} night{nights !== 1 ? "s" : ""})</span>}
          </div>

          {/* Maps Pin */}
          {stayin.maps_pin && (
            <a
              href={stayin.maps_pin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline mt-1"
            >
              View on Maps →
            </a>
          )}
        </div>
      </div>
    );
  };

  // Show full-page Add Stay In form
  if (showAddForm) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex flex-col relative px-4 md:px-8 py-6">
        <button
          onClick={() => setShowAddForm(false)}
          className="flex items-center gap-2 text-white hover:text-sky-400 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Back to Stay Ins</span>
        </button>
        <AddStayInForm userId={userId} onSuccess={handleStayInAdded} alwaysOpen={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col relative px-4 md:px-8">
      {/* Add Stay In Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(true)}
          className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-black font-semibold rounded-full transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Add Stay In
        </button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="text-sky-400 text-2xl font-semibold mb-3">
          Stay Ins
        </div>

        {/* Year Tabs - scrollable like TripHistory */}
        {tabs.length > 0 && (
          <div className="w-full overflow-x-auto scrollbar-hide relative bg-black my-0">
            <div className="flex gap-1 py-2 min-w-[max-content] pl-1 pr-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setSelectedYear(tab);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  className={`px-5 py-2 transition-all whitespace-nowrap focus:outline-none ${
                    tab === selectedYear
                      ? "bg-sky-500 text-black font-semibold rounded-full"
                      : "text-sky-400 hover:text-sky-300 bg-transparent"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stay Ins Grid */}
      {filteredStayins.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No stay ins found</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredStayins.slice(0, visibleCount).map((stayin) => (
              <StayCard key={stayin.id} stayin={stayin} />
            ))}
          </div>

          {/* Load More */}
          {visibleCount < filteredStayins.length && (
            <div className="flex justify-center mb-6">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-black font-semibold"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

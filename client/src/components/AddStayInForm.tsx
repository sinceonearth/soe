"use client";

import { useState } from "react";
import { Building2, MapPin, Calendar, X } from "lucide-react";

interface AddStayInFormProps {
  userId: string;
  onSuccess?: () => void;
  alwaysOpen?: boolean;
}

export default function AddStayInForm({
  userId,
  onSuccess,
  alwaysOpen = false,
}: AddStayInFormProps) {
  const [isOpen, setIsOpen] = useState(alwaysOpen);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    country: "",
    check_in: "",
    check_out: "",
    maps_pin: "",
    type: "HOTEL",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch("/api/stayins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to add stay in");
      }

      // Reset form
      setFormData({
        name: "",
        city: "",
        country: "",
        check_in: "",
        check_out: "",
        maps_pin: "",
        type: "HOTEL",
      });

      setIsOpen(false);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Failed to add stay in");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className={alwaysOpen ? "w-full" : "mb-6"}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-black font-semibold rounded-full transition-all"
        >
          + Add Stay In
        </button>
      ) : (
        <div
          className={`${
            alwaysOpen ? "w-full" : "bg-neutral-900 border border-gray-700 rounded-xl p-6 max-w-2xl"
          }`}
        >
          {/* Header */}
          {!alwaysOpen ? (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-sky-400 flex items-center gap-2">
                <Building2 size={24} />
                Add New Stay In
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          ) : (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-sky-400">
                Add New Stay In
              </h2>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-400 px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Accommodation Name */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  Accommodation Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-neutral-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-sky-500"
                  placeholder="e.g., Hilton Garden Inn"
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-neutral-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="HOTEL">Hotel</option>
                  <option value="AIRBNB">Airbnb</option>
                  <option value="HOSTEL">Hostel</option>
                  <option value="MOTEL">Motel</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-neutral-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-sky-500"
                  placeholder="e.g., New York"
                />
              </div>

              {/* Country */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-neutral-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-sky-500"
                  placeholder="e.g., USA"
                />
              </div>

              {/* Check-in */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                  <Calendar size={14} />
                  Check-in Date *
                </label>
                <input
                  type="date"
                  name="check_in"
                  value={formData.check_in}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-neutral-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Check-out */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                  <Calendar size={14} />
                  Check-out Date *
                </label>
                <input
                  type="date"
                  name="check_out"
                  value={formData.check_out}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-neutral-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Google Maps Link */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                <MapPin size={14} />
                Google Maps Link (optional)
              </label>
              <input
                type="url"
                name="maps_pin"
                value={formData.maps_pin}
                onChange={handleChange}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full px-3 py-2 bg-neutral-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-2 bg-sky-500 hover:bg-sky-600 text-black font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add Stay In"}
              </button>
              {!alwaysOpen && (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

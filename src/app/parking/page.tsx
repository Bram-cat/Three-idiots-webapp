"use client";

import ParkingSpots from "@/components/ParkingSpots";

export default function ParkingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#00171f]">Parking</h1>
      <ParkingSpots />

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-[#007ea7]/10">
        <h3 className="font-semibold text-[#00171f] mb-3">Legend</h3>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded-full" />
            <span className="text-[#007ea7]">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 rounded-full" />
            <span className="text-[#007ea7]">Occupied</span>
          </div>
        </div>
      </div>
    </div>
  );
}

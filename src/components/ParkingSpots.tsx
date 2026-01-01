"use client";

import { useState, useEffect } from "react";
import {
  ParkingSpot,
  getParkingSpots,
  claimParkingSpot,
  releaseParkingSpot,
  roommateConfig,
} from "@/lib/store";
import { useCurrentUser } from "@/context/UserContext";

export default function ParkingSpots() {
  const { oderId, userName } = useCurrentUser();
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await getParkingSpots();
      setSpots(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleClaim = async (spotId: string) => {
    if (!oderId || !userName) return;
    setIsClaiming(true);
    const success = await claimParkingSpot(spotId, oderId, userName, vehicleInfo || undefined);
    if (success) {
      const data = await getParkingSpots();
      setSpots(data);
      setSelectedSpot(null);
      setVehicleInfo("");
    }
    setIsClaiming(false);
  };

  const handleRelease = async (spotId: string) => {
    const success = await releaseParkingSpot(spotId);
    if (success) {
      const data = await getParkingSpots();
      setSpots(data);
    }
  };

  const getOccupantDisplay = (spot: ParkingSpot) => {
    if (!spot.userName) return null;
    const config = roommateConfig[spot.userName];
    return {
      name: spot.userName,
      avatar: config?.avatar || "👤",
      color: config?.color || "bg-gray-500",
    };
  };

  const mySpot = spots.find((s) => s.userId === oderId);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-[#007ea7]/10">
        <div className="flex items-center justify-center h-48">
          <div className="w-12 h-12 border-4 border-[#00a7e1] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 border border-[#007ea7]/10">
      <h2 className="text-lg font-semibold text-[#00171f] flex items-center gap-2">
        Parking Spots
      </h2>

      {/* Parking Grid */}
      <div className="grid grid-cols-2 gap-4">
        {spots.map((spot) => {
          const occupant = getOccupantDisplay(spot);
          const isMySpot = spot.userId === oderId;

          return (
            <div
              key={spot.id}
              className={`relative border-2 rounded-xl p-4 transition-all ${
                spot.isOccupied
                  ? isMySpot
                    ? "border-[#00a7e1] bg-[#00a7e1]/10"
                    : "border-gray-300 bg-gray-50"
                  : "border-dashed border-[#007ea7]/30 hover:border-[#00a7e1] cursor-pointer"
              }`}
              onClick={() => {
                if (!spot.isOccupied && !mySpot) {
                  setSelectedSpot(spot.id);
                }
              }}
            >
              {/* Spot Number */}
              <div className="absolute -top-3 left-3 bg-white px-2 text-sm font-medium text-[#007ea7]">
                Spot #{spot.spotNumber}
              </div>

              {spot.isOccupied && occupant ? (
                <div className="text-center space-y-2">
                  <div
                    className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl ${occupant.color}`}
                  >
                    {occupant.avatar}
                  </div>
                  <p className="font-medium text-[#00171f]">{occupant.name}</p>
                  {spot.vehicleInfo && (
                    <p className="text-xs text-[#007ea7]">{spot.vehicleInfo}</p>
                  )}
                  {isMySpot && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRelease(spot.id);
                      }}
                      className="text-red-500 text-sm hover:text-red-600"
                    >
                      Release Spot
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-3xl text-gray-300">🅿️</span>
                  <p className="text-sm text-[#007ea7] mt-1">Available</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Claim Modal */}
      {selectedSpot && !mySpot && (
        <div className="fixed inset-0 bg-[#00171f]/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-semibold text-[#00171f]">Claim Parking Spot</h3>
            <div className="space-y-2">
              <label className="block text-sm text-[#007ea7]">
                Vehicle Info (Optional)
              </label>
              <input
                type="text"
                value={vehicleInfo}
                onChange={(e) => setVehicleInfo(e.target.value)}
                placeholder="e.g., Blue Honda Civic"
                className="w-full px-4 py-2 border border-[#007ea7]/30 rounded-lg focus:ring-2 focus:ring-[#00a7e1] focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedSpot(null);
                  setVehicleInfo("");
                }}
                className="flex-1 px-4 py-2 border border-[#007ea7]/30 rounded-lg text-[#003459] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleClaim(selectedSpot)}
                disabled={isClaiming}
                className="flex-1 px-4 py-2 bg-[#00a7e1] text-white rounded-lg hover:bg-[#007ea7] disabled:opacity-50"
              >
                {isClaiming ? "Claiming..." : "Claim Spot"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Message */}
      {mySpot && (
        <div className="bg-[#00a7e1]/10 border border-[#00a7e1]/30 rounded-lg p-4 text-center">
          <p className="text-[#003459]">
            You are parked in Spot #{mySpot.spotNumber}
          </p>
        </div>
      )}

      {!mySpot && spots.every((s) => s.isOccupied) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800">All parking spots are occupied</p>
        </div>
      )}
    </div>
  );
}

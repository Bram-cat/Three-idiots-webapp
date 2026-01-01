"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ParkingSpot,
  getParkingSpots,
  claimParkingSpot,
  releaseParkingSpot,
  roommateConfig,
} from "@/lib/store";
import { useCurrentUser } from "@/context/UserContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Car } from "lucide-react";

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
      image: config?.image || "/images/default.png",
    };
  };

  const mySpot = spots.find((s) => s.userId === oderId);

  if (isLoading) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Parking Spots</h2>

          {/* Parking Grid */}
          <div className="grid grid-cols-2 gap-4">
            {spots.map((spot) => {
              const occupant = getOccupantDisplay(spot);
              const isMySpot = spot.userId === oderId;

              return (
                <div
                  key={spot.id}
                  className={`relative border-2 rounded-xl p-6 transition-all ${
                    spot.isOccupied
                      ? isMySpot
                        ? "border-cyan-500/50 bg-cyan-500/5"
                        : "border-zinc-700 bg-zinc-800/30"
                      : "border-dashed border-zinc-700 hover:border-cyan-500/50 cursor-pointer bg-zinc-900/50"
                  }`}
                  onClick={() => {
                    if (!spot.isOccupied && !mySpot) {
                      setSelectedSpot(spot.id);
                    }
                  }}
                >
                  {/* Spot Number */}
                  <div className="absolute -top-3 left-3 bg-black px-2 text-sm font-medium text-zinc-400">
                    Spot #{spot.spotNumber}
                  </div>

                  {spot.isOccupied && occupant ? (
                    <div className="text-center space-y-3">
                      <div className="relative w-14 h-14 mx-auto rounded-full overflow-hidden ring-2 ring-zinc-700">
                        <Image
                          src={occupant.image}
                          alt={occupant.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="font-medium text-white">{occupant.name}</p>
                      {spot.vehicleInfo && (
                        <p className="text-xs text-zinc-500">{spot.vehicleInfo}</p>
                      )}
                      {isMySpot && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRelease(spot.id);
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          Release Spot
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Car className="w-10 h-10 mx-auto text-zinc-600" />
                      <p className="text-sm text-zinc-500 mt-2">Available</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Claim Dialog */}
      <Dialog open={!!selectedSpot && !mySpot} onOpenChange={() => setSelectedSpot(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Claim Parking Spot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="block text-sm text-zinc-400">
                Vehicle Info (Optional)
              </label>
              <Input
                type="text"
                value={vehicleInfo}
                onChange={(e) => setVehicleInfo(e.target.value)}
                placeholder="e.g., Blue Honda Civic"
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedSpot(null);
                  setVehicleInfo("");
                }}
                className="flex-1 border-zinc-700 bg-transparent text-white hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedSpot && handleClaim(selectedSpot)}
                disabled={isClaiming}
                className="flex-1 bg-cyan-500 text-black hover:bg-cyan-400"
              >
                {isClaiming ? "Claiming..." : "Claim Spot"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Message */}
      {mySpot && (
        <Card className="bg-cyan-500/10 border-cyan-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-cyan-400">
              You are parked in Spot #{mySpot.spotNumber}
            </p>
          </CardContent>
        </Card>
      )}

      {!mySpot && spots.every((s) => s.isOccupied) && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-red-400">All parking spots are occupied</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

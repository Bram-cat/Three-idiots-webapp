"use client";

import ParkingSpots from "@/components/ParkingSpots";
import { Card, CardContent } from "@/components/ui/card";
import { AnimateOnScroll } from "@/hooks/useScrollAnimation";

export default function ParkingPage() {
  return (
    <div className="space-y-6">
      <AnimateOnScroll animation="fadeInUp">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Parking</h1>
      </AnimateOnScroll>

      <AnimateOnScroll animation="scaleIn" delay={100}>
        <ParkingSpots />
      </AnimateOnScroll>

      {/* Legend */}
      <AnimateOnScroll animation="fadeInUp" delay={200}>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <h3 className="font-semibold text-white mb-3">Legend</h3>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-400 rounded-full" />
                <span className="text-zinc-400">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-400 rounded-full" />
                <span className="text-zinc-400">Occupied</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimateOnScroll>
    </div>
  );
}

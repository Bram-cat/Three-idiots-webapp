"use client";

import WashingMachine from "@/components/WashingMachine";
import { Card, CardContent } from "@/components/ui/card";
import { AnimateOnScroll } from "@/hooks/useScrollAnimation";

export default function WashingPage() {
  return (
    <div className="space-y-6">
      <AnimateOnScroll animation="fadeInUp">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Laundry</h1>
      </AnimateOnScroll>

      <AnimateOnScroll animation="scaleIn" delay={100}>
        <WashingMachine />
      </AnimateOnScroll>

      {/* Tips */}
      <AnimateOnScroll animation="fadeInUp" delay={200}>
        <Card className="bg-cyan-500/5 border-cyan-500/20">
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold text-white">Tips</h3>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>Set a timer when you start your laundry</li>
              <li>Others can see when the machine is in use</li>
              <li>Remove your clothes promptly when done</li>
            </ul>
          </CardContent>
        </Card>
      </AnimateOnScroll>
    </div>
  );
}

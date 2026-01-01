"use client";

import WashingMachine from "@/components/WashingMachine";

export default function WashingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#00171f]">Washing Machine</h1>
      <WashingMachine />

      {/* Tips */}
      <div className="bg-[#00a7e1]/10 rounded-xl p-4 space-y-2 border border-[#00a7e1]/20">
        <h3 className="font-semibold text-[#003459]">Tips</h3>
        <ul className="text-sm text-[#007ea7] space-y-1">
          <li>Set a timer when you start your laundry</li>
          <li>Others can see when the machine is in use</li>
          <li>Remove your clothes promptly when done</li>
        </ul>
      </div>
    </div>
  );
}

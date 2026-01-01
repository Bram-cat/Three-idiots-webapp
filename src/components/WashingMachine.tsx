"use client";

import { useState, useEffect } from "react";
import {
  WashingMachineSlot,
  getWashingMachine,
  startWashingMachine,
  stopWashingMachine,
  roommateConfig,
} from "@/lib/store";
import { useCurrentUser } from "@/context/UserContext";

export default function WashingMachine() {
  const { oderId, userName } = useCurrentUser();
  const [slot, setSlot] = useState<WashingMachineSlot | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [duration, setDuration] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await getWashingMachine();
      setSlot(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!slot?.isActive || !slot.endTime) {
      setTimeRemaining(0);
      return;
    }

    const updateTimer = async () => {
      const now = new Date();
      const end = new Date(slot.endTime!);
      const remaining = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        const data = await getWashingMachine();
        setSlot(data);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [slot]);

  const handleStart = async () => {
    if (!oderId || !userName) return;
    setIsStarting(true);
    const newSlot = await startWashingMachine(oderId, userName, duration);
    if (newSlot) setSlot(newSlot);
    setIsStarting(false);
  };

  const handleStop = async () => {
    const newSlot = await stopWashingMachine();
    setSlot(newSlot);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isMyMachine = slot?.userId === oderId;
  const activeUserConfig = slot?.userName ? roommateConfig[slot.userName] : null;

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
        Washing Machine
      </h2>

      {/* Status Display */}
      <div className="text-center">
        {slot?.isActive ? (
          <div className="space-y-4">
            {/* Spinning Animation */}
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 rounded-full border-8 border-gray-200" />
              <div
                className="absolute inset-0 rounded-full border-8 border-[#00a7e1] border-t-transparent animate-spin"
                style={{ animationDuration: "1s" }}
              />
              <div className="absolute inset-4 bg-[#00a7e1]/20 rounded-full flex items-center justify-center">
                <span className="text-3xl animate-pulse">🧺</span>
              </div>
            </div>

            {/* Timer */}
            <div>
              <p className="text-4xl font-mono font-bold text-[#00a7e1]">
                {formatTime(timeRemaining)}
              </p>
              <p className="text-[#007ea7] mt-1">remaining</p>
            </div>

            {/* User info */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-[#007ea7]">Used by:</span>
              <span
                className={`${activeUserConfig?.color || "bg-gray-500"} text-white px-3 py-1 rounded-full text-sm`}
              >
                {activeUserConfig?.avatar} {slot.userName}
              </span>
            </div>

            {/* Stop button (only for current user) */}
            {isMyMachine && (
              <button
                onClick={handleStop}
                className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Stop Early
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Idle state */}
            <div className="mx-auto w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center bg-gray-50">
              <span className="text-4xl">🧺</span>
            </div>
            <p className="text-green-600 font-medium">Available</p>

            {/* Duration selector */}
            <div className="space-y-2">
              <label className="block text-sm text-[#007ea7]">Timer Duration</label>
              <div className="flex justify-center gap-2">
                {[30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      duration === mins
                        ? "bg-[#00a7e1] text-white"
                        : "bg-gray-100 text-[#003459] hover:bg-gray-200"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="bg-[#00a7e1] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#007ea7] transition-colors disabled:opacity-50"
            >
              {isStarting ? "Starting..." : `Start Washing (${duration} min)`}
            </button>
          </div>
        )}
      </div>

      {/* Status indicator for others */}
      {slot?.isActive && !isMyMachine && (
        <div className="bg-[#00a7e1]/10 border border-[#00a7e1]/30 rounded-lg p-4 text-center">
          <p className="text-[#003459]">
            Please wait, {slot.userName} is using the washing machine
          </p>
        </div>
      )}
    </div>
  );
}

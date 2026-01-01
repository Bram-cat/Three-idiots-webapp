"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  WashingMachineSlot,
  MachineSlot,
  getWashingMachine,
  startWashingMachine,
  stopWashingMachine,
  getMachine,
  startMachine,
  stopMachine,
  roommateConfig,
} from "@/lib/store";
import { useCurrentUser } from "@/context/UserContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type MachineType = "washer" | "dryer";

interface MachineCardProps {
  type: MachineType;
  slot: MachineSlot | WashingMachineSlot | null;
  timeRemaining: number;
  duration: number;
  setDuration: (d: number) => void;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  isStarting: boolean;
  userId: string | null;
}

function MachineCard({
  type,
  slot,
  timeRemaining,
  duration,
  setDuration,
  onStart,
  onStop,
  isStarting,
  userId,
}: MachineCardProps) {
  const isMyMachine = slot?.userId === userId;
  const activeUserConfig = slot?.userName ? roommateConfig[slot.userName] : null;
  const machineName = type === "washer" ? "Washing Machine" : "Dryer";
  const machineIcon = type === "washer" ? "washer" : "dryer";

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">{machineName}</h2>

        {/* Status Display */}
        <div className="text-center">
          {slot?.isActive ? (
            <div className="space-y-4">
              {/* Spinning Animation */}
              <div className="relative mx-auto w-32 h-32">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"
                  style={{ animationDuration: "1s" }}
                />
                <div className="absolute inset-4 bg-cyan-500/10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-cyan-400 animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {type === "washer" ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                      />
                    )}
                  </svg>
                </div>
              </div>

              {/* Timer */}
              <div>
                <p className="text-4xl font-mono font-bold text-cyan-400">
                  {formatTime(timeRemaining)}
                </p>
                <p className="text-zinc-400 mt-1">remaining</p>
              </div>

              {/* User info */}
              <div className="flex items-center justify-center gap-3">
                <span className="text-zinc-400">Used by:</span>
                <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-full">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden ring-1 ring-cyan-500/50">
                    <Image
                      src={activeUserConfig?.image || "/images/default.png"}
                      alt={slot.userName || "User"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-white">{slot.userName}</span>
                </div>
              </div>

              {/* Stop button (only for current user) */}
              {isMyMachine && (
                <Button
                  onClick={onStop}
                  variant="destructive"
                  className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                >
                  Stop Early
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Idle state */}
              <div className="mx-auto w-32 h-32 rounded-full border-4 border-zinc-800 flex items-center justify-center bg-zinc-900">
                <svg
                  className="w-12 h-12 text-zinc-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {type === "washer" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                    />
                  )}
                </svg>
              </div>
              <p className="text-green-400 font-medium">Available</p>

              {/* Duration selector */}
              <div className="space-y-3">
                <label className="block text-sm text-zinc-400">Timer Duration</label>
                <div className="flex justify-center gap-2">
                  {[30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDuration(mins)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        duration === mins
                          ? "bg-cyan-500 text-black"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Start button */}
              <Button
                onClick={onStart}
                disabled={isStarting}
                className="bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50 px-8"
              >
                {isStarting ? "Starting..." : `Start ${machineName} (${duration} min)`}
              </Button>
            </div>
          )}
        </div>

        {/* Status indicator for others */}
        {slot?.isActive && !isMyMachine && (
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 text-center">
            <p className="text-zinc-300">
              Please wait, {slot.userName} is using the {machineName.toLowerCase()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function WashingMachineComponent() {
  const { oderId, userName } = useCurrentUser();
  const [washerSlot, setWasherSlot] = useState<WashingMachineSlot | null>(null);
  const [dryerSlot, setDryerSlot] = useState<MachineSlot | null>(null);
  const [washerTimeRemaining, setWasherTimeRemaining] = useState<number>(0);
  const [dryerTimeRemaining, setDryerTimeRemaining] = useState<number>(0);
  const [washerDuration, setWasherDuration] = useState(30);
  const [dryerDuration, setDryerDuration] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingWasher, setIsStartingWasher] = useState(false);
  const [isStartingDryer, setIsStartingDryer] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [washerData, dryerData] = await Promise.all([
        getWashingMachine(),
        getMachine("dryer"),
      ]);
      setWasherSlot(washerData);
      setDryerSlot(dryerData);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Washer timer
  useEffect(() => {
    if (!washerSlot?.isActive || !washerSlot.endTime) {
      setWasherTimeRemaining(0);
      return;
    }

    const updateTimer = async () => {
      const now = new Date();
      const end = new Date(washerSlot.endTime!);
      const remaining = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
      setWasherTimeRemaining(remaining);

      if (remaining === 0) {
        const data = await getWashingMachine();
        setWasherSlot(data);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [washerSlot]);

  // Dryer timer
  useEffect(() => {
    if (!dryerSlot?.isActive || !dryerSlot.endTime) {
      setDryerTimeRemaining(0);
      return;
    }

    const updateTimer = async () => {
      const now = new Date();
      const end = new Date(dryerSlot.endTime!);
      const remaining = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
      setDryerTimeRemaining(remaining);

      if (remaining === 0) {
        const data = await getMachine("dryer");
        setDryerSlot(data);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [dryerSlot]);

  const handleStartWasher = async () => {
    if (!oderId || !userName) return;
    setIsStartingWasher(true);
    const newSlot = await startWashingMachine(oderId, userName, washerDuration);
    if (newSlot) setWasherSlot(newSlot);
    setIsStartingWasher(false);
  };

  const handleStopWasher = async () => {
    const newSlot = await stopWashingMachine();
    setWasherSlot(newSlot);
  };

  const handleStartDryer = async () => {
    if (!oderId || !userName) return;
    setIsStartingDryer(true);
    const newSlot = await startMachine("dryer", oderId, userName, dryerDuration);
    if (newSlot) setDryerSlot(newSlot);
    setIsStartingDryer(false);
  };

  const handleStopDryer = async () => {
    const newSlot = await stopMachine("dryer");
    setDryerSlot(newSlot);
  };

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
    <Tabs defaultValue="washer" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800">
        <TabsTrigger
          value="washer"
          className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black"
        >
          Washing Machine
          {washerSlot?.isActive && (
            <span className="ml-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          )}
        </TabsTrigger>
        <TabsTrigger
          value="dryer"
          className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black"
        >
          Dryer
          {dryerSlot?.isActive && (
            <span className="ml-2 w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="washer" className="mt-4">
        <MachineCard
          type="washer"
          slot={washerSlot}
          timeRemaining={washerTimeRemaining}
          duration={washerDuration}
          setDuration={setWasherDuration}
          onStart={handleStartWasher}
          onStop={handleStopWasher}
          isStarting={isStartingWasher}
          userId={oderId}
        />
      </TabsContent>

      <TabsContent value="dryer" className="mt-4">
        <MachineCard
          type="dryer"
          slot={dryerSlot}
          timeRemaining={dryerTimeRemaining}
          duration={dryerDuration}
          setDuration={setDryerDuration}
          onStart={handleStartDryer}
          onStop={handleStopDryer}
          isStarting={isStartingDryer}
          userId={oderId}
        />
      </TabsContent>
    </Tabs>
  );
}

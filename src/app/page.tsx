"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Expense,
  WashingMachineSlot,
  ParkingSpot,
  getExpenses,
  getWashingMachine,
  getParkingSpots,
  getUsers,
  User,
  roommateConfig,
} from "@/lib/store";
import { useCurrentUser } from "@/context/UserContext";
import HeroSection from "@/components/HeroSection";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt, Clock, Car, WashingMachine, ChevronRight } from "lucide-react";
import { AnimateOnScroll } from "@/hooks/useScrollAnimation";

export default function Dashboard() {
  const { userName, userImage, oderId } = useCurrentUser();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [washingMachine, setWashingMachine] = useState<WashingMachineSlot | null>(null);
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [expensesData, washingData, parkingData, usersData] = await Promise.all([
        getExpenses(),
        getWashingMachine(),
        getParkingSpots(),
        getUsers(),
      ]);
      setExpenses(expensesData);
      setWashingMachine(washingData);
      setParkingSpots(parkingData);
      setUsers(usersData);
      setIsLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!washingMachine?.isActive || !washingMachine.endTime) return;

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.floor(
          (new Date(washingMachine.endTime!).getTime() - Date.now()) / 1000
        )
      );
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [washingMachine]);

  const pendingExpenses = expenses.filter((e) => e.status === "pending");
  const pendingApprovals = pendingExpenses.filter(
    (e) => e.paidBy !== oderId && !e.approvals.includes(oderId || "")
  );
  const totalPending = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);
  const occupiedSpots = parkingSpots.filter((s) => s.isOccupied).length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const roommateSlots = ["Ram", "Munna", "Suriya", "Kaushik"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <HeroSection />

      {/* Welcome Card */}
      <AnimateOnScroll animation="fadeInUp">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden ring-2 ring-cyan-500 ring-offset-2 ring-offset-black flex-shrink-0">
                <Image
                  src={userImage}
                  alt={userName || "User"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                  Hey, {userName}!
                </h1>
                <p className="text-zinc-400 text-sm sm:text-base">Here&apos;s your roommate dashboard</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimateOnScroll>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Pending Approvals */}
        <AnimateOnScroll animation="slideInLeft" delay={100}>
          <Link href="/expenses">
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-cyan-500/50 transition-all cursor-pointer group h-full">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors flex-shrink-0">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl sm:text-3xl font-bold text-white">
                      {pendingApprovals.length}
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-400 truncate">Need Your Approval</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </AnimateOnScroll>

        {/* Total Pending */}
        <AnimateOnScroll animation="slideInRight" delay={100}>
          <Link href="/expenses">
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-cyan-500/50 transition-all cursor-pointer group h-full">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500/10 rounded-xl flex items-center justify-center group-hover:bg-teal-500/20 transition-colors flex-shrink-0">
                    <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl sm:text-3xl font-bold text-white">
                      ${totalPending.toFixed(0)}
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-400 truncate">Pending Expenses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </AnimateOnScroll>
      </div>

      {/* Washing Machine Status */}
      <AnimateOnScroll animation="fadeInUp" delay={200}>
        <Link href="/washing">
          <Card className="bg-zinc-900/50 border-zinc-800 hover:border-cyan-500/50 transition-all cursor-pointer group">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      washingMachine?.isActive
                        ? "bg-cyan-500/20 animate-pulse"
                        : "bg-zinc-800"
                    }`}
                  >
                    <WashingMachine className={`w-6 h-6 sm:w-7 sm:h-7 ${washingMachine?.isActive ? "text-cyan-400" : "text-zinc-500"}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white text-sm sm:text-base">Washing Machine</h3>
                    {washingMachine?.isActive ? (
                      <p className="text-xs sm:text-sm text-cyan-400 truncate">
                        {washingMachine.userName} is using - {formatTime(timeRemaining)} left
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm text-green-400">Available</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </AnimateOnScroll>

      {/* Parking Status */}
      <AnimateOnScroll animation="fadeInUp" delay={300}>
        <Link href="/parking">
          <Card className="bg-zinc-900/50 border-zinc-800 hover:border-cyan-500/50 transition-all cursor-pointer group">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Car className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white text-sm sm:text-base">Parking Spots</h3>
                    <p className="text-xs sm:text-sm text-zinc-400">
                      {occupiedSpots}/4 spots occupied
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 sm:gap-1.5 flex-shrink-0">
                  {parkingSpots.map((spot) => (
                    <div
                      key={spot.id}
                      className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                        spot.isOccupied ? "bg-red-400" : "bg-green-400"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </AnimateOnScroll>

      {/* Roommates */}
      <AnimateOnScroll animation="scaleIn" delay={400}>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold text-white mb-4">Roommates</h3>
            <div className="flex justify-around">
              {roommateSlots.map((name, index) => {
                const registeredUser = users.find((u) => u.name === name);
                const config = roommateConfig[name];
                const isCurrentUser = name === userName;

                return (
                  <div
                    key={name}
                    className="text-center"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div
                      className={`relative w-11 h-11 sm:w-14 sm:h-14 mx-auto rounded-full overflow-hidden ${
                        isCurrentUser
                          ? "ring-2 ring-offset-2 ring-offset-black ring-cyan-500"
                          : registeredUser
                          ? "ring-2 ring-zinc-700"
                          : "ring-2 ring-zinc-800 opacity-40"
                      }`}
                    >
                      <Image
                        src={config.image}
                        alt={name}
                        fill
                        className="object-cover"
                      />
                      {!registeredUser && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-zinc-400 text-xs">?</span>
                        </div>
                      )}
                    </div>
                    <p
                      className={`text-xs sm:text-sm mt-2 ${
                        registeredUser ? "text-white" : "text-zinc-600"
                      }`}
                    >
                      {name}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </AnimateOnScroll>
    </div>
  );
}

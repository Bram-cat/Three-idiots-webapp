"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

export default function Dashboard() {
  const { userName, userAvatar, userColor, oderId } = useCurrentUser();
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

  // Show all 4 roommate slots
  const roommateSlots = ["Ram", "Munna", "Suriya", "Kaushik"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-[#00a7e1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-[#007ea7]/10">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${userColor}`}
          >
            {userAvatar}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#00171f]">
              Hey, {userName}!
            </h1>
            <p className="text-[#007ea7]">Here&apos;s your roommate dashboard</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Pending Approvals */}
        <Link
          href="/expenses"
          className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow border border-[#007ea7]/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00a7e1]/20 rounded-full flex items-center justify-center">
              <span className="text-xl">⏳</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#00171f]">
                {pendingApprovals.length}
              </p>
              <p className="text-sm text-[#007ea7]">Need Your Approval</p>
            </div>
          </div>
        </Link>

        {/* Total Pending */}
        <Link
          href="/expenses"
          className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow border border-[#007ea7]/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#007ea7]/20 rounded-full flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#00171f]">
                ${totalPending.toFixed(0)}
              </p>
              <p className="text-sm text-[#007ea7]">Pending Expenses</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Washing Machine Status */}
      <Link
        href="/washing"
        className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow border border-[#007ea7]/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                washingMachine?.isActive ? "bg-[#00a7e1]/20 animate-pulse" : "bg-gray-100"
              }`}
            >
              🧺
            </div>
            <div>
              <h3 className="font-semibold text-[#00171f]">Washing Machine</h3>
              {washingMachine?.isActive ? (
                <p className="text-sm text-[#00a7e1]">
                  {washingMachine.userName} is using - {formatTime(timeRemaining)} left
                </p>
              ) : (
                <p className="text-sm text-green-600">Available</p>
              )}
            </div>
          </div>
          <span className="text-[#007ea7]">→</span>
        </div>
      </Link>

      {/* Parking Status */}
      <Link
        href="/parking"
        className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow border border-[#007ea7]/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
              🚗
            </div>
            <div>
              <h3 className="font-semibold text-[#00171f]">Parking Spots</h3>
              <p className="text-sm text-[#007ea7]">
                {occupiedSpots}/4 spots occupied
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {parkingSpots.map((spot) => (
              <div
                key={spot.id}
                className={`w-3 h-3 rounded-full ${
                  spot.isOccupied ? "bg-red-400" : "bg-green-400"
                }`}
              />
            ))}
          </div>
        </div>
      </Link>

      {/* Roommates */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-[#007ea7]/10">
        <h3 className="font-semibold text-[#00171f] mb-3">Roommates</h3>
        <div className="flex justify-around">
          {roommateSlots.map((name) => {
            const registeredUser = users.find((u) => u.name === name);
            const config = roommateConfig[name];
            const isCurrentUser = name === userName;

            return (
              <div key={name} className="text-center">
                <div
                  className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl ${
                    registeredUser ? config.color : "bg-gray-200"
                  } ${isCurrentUser ? "ring-2 ring-offset-2 ring-[#00a7e1]" : ""}`}
                >
                  {registeredUser ? config.avatar : "❓"}
                </div>
                <p className={`text-sm mt-1 ${registeredUser ? "text-[#00171f]" : "text-gray-400"}`}>
                  {name}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

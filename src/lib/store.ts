"use client";

import { supabase } from "./supabase";

export interface User {
  id: string;
  name: string;
  clerkId?: string;
  avatar: string;
  color: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  paidBy: string;
  receiptImage?: string;
  createdAt: Date;
  approvals: string[];
  status: "pending" | "approved" | "rejected";
}

export interface WashingMachineSlot {
  id: string;
  userId: string | null;
  userName?: string | null;
  startTime: Date | null;
  endTime: Date | null;
  isActive: boolean;
}

export interface ParkingSpot {
  id: string;
  spotNumber: number;
  userId: string | null;
  userName?: string | null;
  vehicleInfo?: string;
  isOccupied: boolean;
}

// Four roommates with their colors
export const roommateConfig: Record<string, { avatar: string; color: string }> = {
  Ram: { avatar: "🔴", color: "bg-[#00a7e1]" },
  Munna: { avatar: "🟢", color: "bg-[#007ea7]" },
  Suriya: { avatar: "🟣", color: "bg-[#003459]" },
  Kaushik: { avatar: "🟠", color: "bg-[#00171f]" },
};

// Expenses
export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select(`
      *,
      expense_approvals (user_id)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }

  return (data || []).map((e) => ({
    id: e.id,
    description: e.description,
    amount: e.amount,
    category: e.category,
    paidBy: e.paid_by,
    receiptImage: e.receipt_image,
    createdAt: new Date(e.created_at),
    approvals: e.expense_approvals?.map((a: { user_id: string }) => a.user_id) || [],
    status: e.status,
  }));
}

export async function addExpense(
  expense: Omit<Expense, "id" | "createdAt" | "approvals" | "status">
): Promise<Expense | null> {
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      paid_by: expense.paidBy,
      receipt_image: expense.receiptImage,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding expense:", error);
    return null;
  }

  return {
    id: data.id,
    description: data.description,
    amount: data.amount,
    category: data.category,
    paidBy: data.paid_by,
    receiptImage: data.receipt_image,
    createdAt: new Date(data.created_at),
    approvals: [],
    status: data.status,
  };
}

export async function approveExpense(
  expenseId: string,
  oderId: string
): Promise<boolean> {
  // Add approval
  const { error: approvalError } = await supabase
    .from("expense_approvals")
    .insert({
      expense_id: expenseId,
      user_id: oderId,
    });

  if (approvalError) {
    console.error("Error approving expense:", approvalError);
    return false;
  }

  // Check if we have 3 approvals
  const { data: approvals } = await supabase
    .from("expense_approvals")
    .select("id")
    .eq("expense_id", expenseId);

  if (approvals && approvals.length >= 3) {
    await supabase
      .from("expenses")
      .update({ status: "approved" })
      .eq("id", expenseId);
  }

  return true;
}

// Washing Machine
export async function getWashingMachine(): Promise<WashingMachineSlot> {
  const defaultSlot: WashingMachineSlot = {
    id: "1",
    userId: null,
    userName: null,
    startTime: null,
    endTime: null,
    isActive: false,
  };

  const { data, error } = await supabase
    .from("washing_machine")
    .select("*")
    .eq("id", "1")
    .single();

  if (error || !data) {
    return defaultSlot;
  }

  // Check if timer has expired
  if (data.is_active && data.end_time && new Date() > new Date(data.end_time)) {
    await stopWashingMachine();
    return defaultSlot;
  }

  return {
    id: data.id,
    userId: data.user_id,
    userName: data.user_name,
    startTime: data.start_time ? new Date(data.start_time) : null,
    endTime: data.end_time ? new Date(data.end_time) : null,
    isActive: data.is_active,
  };
}

export async function startWashingMachine(
  userId: string,
  userName: string,
  durationMinutes: number = 30
): Promise<WashingMachineSlot | null> {
  const now = new Date();
  const endTime = new Date(now.getTime() + durationMinutes * 60 * 1000);

  const { data, error } = await supabase
    .from("washing_machine")
    .upsert({
      id: "1",
      user_id: userId,
      user_name: userName,
      start_time: now.toISOString(),
      end_time: endTime.toISOString(),
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error starting washing machine:", error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    userName: data.user_name,
    startTime: new Date(data.start_time),
    endTime: new Date(data.end_time),
    isActive: data.is_active,
  };
}

export async function stopWashingMachine(): Promise<WashingMachineSlot> {
  await supabase.from("washing_machine").upsert({
    id: "1",
    user_id: null,
    user_name: null,
    start_time: null,
    end_time: null,
    is_active: false,
  });

  return {
    id: "1",
    userId: null,
    userName: null,
    startTime: null,
    endTime: null,
    isActive: false,
  };
}

// Parking Spots
export async function getParkingSpots(): Promise<ParkingSpot[]> {
  const { data, error } = await supabase
    .from("parking_spots")
    .select("*")
    .order("spot_number");

  if (error || !data || data.length === 0) {
    // Return default spots if none exist
    return [
      { id: "1", spotNumber: 1, userId: null, isOccupied: false },
      { id: "2", spotNumber: 2, userId: null, isOccupied: false },
      { id: "3", spotNumber: 3, userId: null, isOccupied: false },
      { id: "4", spotNumber: 4, userId: null, isOccupied: false },
    ];
  }

  return data.map((s) => ({
    id: s.id,
    spotNumber: s.spot_number,
    userId: s.user_id,
    userName: s.user_name,
    vehicleInfo: s.vehicle_info,
    isOccupied: s.is_occupied,
  }));
}

export async function claimParkingSpot(
  spotId: string,
  userId: string,
  userName: string,
  vehicleInfo?: string
): Promise<boolean> {
  const { error } = await supabase
    .from("parking_spots")
    .update({
      user_id: userId,
      user_name: userName,
      vehicle_info: vehicleInfo || null,
      is_occupied: true,
    })
    .eq("id", spotId);

  return !error;
}

export async function releaseParkingSpot(spotId: string): Promise<boolean> {
  const { error } = await supabase
    .from("parking_spots")
    .update({
      user_id: null,
      user_name: null,
      vehicle_info: null,
      is_occupied: false,
    })
    .eq("id", spotId);

  return !error;
}

// Get current user from Supabase
export async function getCurrentUser(
  clerkId: string
): Promise<{ name: string; oderId: string } | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    oderId: data.id,
    name: data.roommate_name,
  };
}

// Get all users
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.from("users").select("*");

  if (error || !data) {
    return [];
  }

  return data.map((u) => ({
    id: u.id,
    name: u.roommate_name,
    clerkId: u.clerk_id,
    avatar: roommateConfig[u.roommate_name]?.avatar || "👤",
    color: roommateConfig[u.roommate_name]?.color || "bg-gray-500",
  }));
}

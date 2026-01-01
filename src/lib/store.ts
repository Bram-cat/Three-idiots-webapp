"use client";

import { supabase } from "./supabase";

export interface User {
  id: string;
  name: string;
  clerkId?: string;
  image: string;
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

export interface MachineSlot {
  id: string;
  machineType: "washer" | "dryer";
  userId: string | null;
  userName?: string | null;
  startTime: Date | null;
  endTime: Date | null;
  isActive: boolean;
}

// Alias for backwards compatibility
export type WashingMachineSlot = MachineSlot;

export interface ParkingSpot {
  id: string;
  spotNumber: number;
  userId: string | null;
  userName?: string | null;
  vehicleInfo?: string;
  isOccupied: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  imageUrl?: string;
  createdAt: Date;
}

// Four roommates with their profile pictures and colors
export const roommateConfig: Record<string, { image: string; color: string; gradient: string }> = {
  Ram: {
    image: "/images/ram.png",
    color: "bg-cyan-500",
    gradient: "from-cyan-500 to-cyan-600"
  },
  Munna: {
    image: "/images/munna.png",
    color: "bg-teal-500",
    gradient: "from-teal-500 to-teal-600"
  },
  Suriya: {
    image: "/images/suriya.png",
    color: "bg-blue-600",
    gradient: "from-blue-500 to-blue-600"
  },
  Kaushik: {
    image: "/images/kaushik.png",
    color: "bg-indigo-600",
    gradient: "from-indigo-500 to-indigo-600"
  },
};

// Get taken roommate names
export async function getTakenNames(): Promise<string[]> {
  const { data, error } = await supabase
    .from("users")
    .select("roommate_name");

  if (error || !data) {
    return [];
  }

  return data.map((u) => u.roommate_name);
}

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

// Machine (Washer/Dryer) functions
export async function getMachine(machineType: "washer" | "dryer"): Promise<MachineSlot> {
  const id = machineType === "washer" ? "1" : "2";
  const tableName = machineType === "washer" ? "washing_machine" : "dryer_machine";

  const defaultSlot: MachineSlot = {
    id,
    machineType,
    userId: null,
    userName: null,
    startTime: null,
    endTime: null,
    isActive: false,
  };

  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return defaultSlot;
  }

  if (data.is_active && data.end_time && new Date() > new Date(data.end_time)) {
    await stopMachine(machineType);
    return defaultSlot;
  }

  return {
    id: data.id,
    machineType,
    userId: data.user_id,
    userName: data.user_name,
    startTime: data.start_time ? new Date(data.start_time) : null,
    endTime: data.end_time ? new Date(data.end_time) : null,
    isActive: data.is_active,
  };
}

export async function startMachine(
  machineType: "washer" | "dryer",
  userId: string,
  userName: string,
  durationMinutes: number = 30
): Promise<MachineSlot | null> {
  const id = machineType === "washer" ? "1" : "2";
  const tableName = machineType === "washer" ? "washing_machine" : "dryer_machine";

  const now = new Date();
  const endTime = new Date(now.getTime() + durationMinutes * 60 * 1000);

  const { data, error } = await supabase
    .from(tableName)
    .upsert({
      id,
      user_id: userId,
      user_name: userName,
      start_time: now.toISOString(),
      end_time: endTime.toISOString(),
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error(`Error starting ${machineType}:`, error);
    return null;
  }

  return {
    id: data.id,
    machineType,
    userId: data.user_id,
    userName: data.user_name,
    startTime: new Date(data.start_time),
    endTime: new Date(data.end_time),
    isActive: data.is_active,
  };
}

export async function stopMachine(machineType: "washer" | "dryer"): Promise<MachineSlot> {
  const id = machineType === "washer" ? "1" : "2";
  const tableName = machineType === "washer" ? "washing_machine" : "dryer_machine";

  await supabase.from(tableName).upsert({
    id,
    user_id: null,
    user_name: null,
    start_time: null,
    end_time: null,
    is_active: false,
  });

  return {
    id,
    machineType,
    userId: null,
    userName: null,
    startTime: null,
    endTime: null,
    isActive: false,
  };
}

// Legacy functions for backwards compatibility
export async function getWashingMachine(): Promise<MachineSlot> {
  return getMachine("washer");
}

export async function startWashingMachine(
  userId: string,
  userName: string,
  durationMinutes: number = 30
): Promise<MachineSlot | null> {
  return startMachine("washer", userId, userName, durationMinutes);
}

export async function stopWashingMachine(): Promise<MachineSlot> {
  return stopMachine("washer");
}

// Parking Spots
export async function getParkingSpots(): Promise<ParkingSpot[]> {
  const { data, error } = await supabase
    .from("parking_spots")
    .select("*")
    .order("spot_number");

  if (error || !data || data.length === 0) {
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

// Chat functions
export async function getChatMessages(): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return (data || []).map((m) => ({
    id: m.id,
    userId: m.user_id,
    userName: m.user_name,
    message: m.message,
    imageUrl: m.image_url,
    createdAt: new Date(m.created_at),
  }));
}

export async function sendChatMessage(
  userId: string,
  userName: string,
  message: string,
  imageUrl?: string
): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      user_id: userId,
      user_name: userName,
      message,
      image_url: imageUrl,
    })
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    userName: data.user_name,
    message: data.message,
    imageUrl: data.image_url,
    createdAt: new Date(data.created_at),
  };
}

export async function editChatMessage(
  messageId: string,
  newMessage: string
): Promise<boolean> {
  const { error } = await supabase
    .from("chat_messages")
    .update({ message: newMessage })
    .eq("id", messageId);

  return !error;
}

export async function deleteChatMessage(messageId: string): Promise<boolean> {
  const { error } = await supabase
    .from("chat_messages")
    .delete()
    .eq("id", messageId);

  return !error;
}

export function subscribeToChatMessages(
  callback: (payload: { eventType: string; message: ChatMessage; oldId?: string }) => void
) {
  const channel = supabase
    .channel("chat_messages_realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "chat_messages" },
      (payload) => {
        if (payload.eventType === "INSERT") {
          const m = payload.new;
          callback({
            eventType: "INSERT",
            message: {
              id: m.id,
              userId: m.user_id,
              userName: m.user_name,
              message: m.message,
              imageUrl: m.image_url,
              createdAt: new Date(m.created_at),
            },
          });
        } else if (payload.eventType === "UPDATE") {
          const m = payload.new;
          callback({
            eventType: "UPDATE",
            message: {
              id: m.id,
              userId: m.user_id,
              userName: m.user_name,
              message: m.message,
              imageUrl: m.image_url,
              createdAt: new Date(m.created_at),
            },
          });
        } else if (payload.eventType === "DELETE") {
          const m = payload.old;
          callback({
            eventType: "DELETE",
            message: {
              id: m.id,
              userId: m.user_id,
              userName: m.user_name,
              message: m.message || "",
              imageUrl: m.image_url,
              createdAt: new Date(m.created_at),
            },
            oldId: m.id,
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
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
    image: roommateConfig[u.roommate_name]?.image || "/images/default.png",
    color: roommateConfig[u.roommate_name]?.color || "bg-gray-500",
  }));
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DBUser {
  id: string;
  clerk_id: string;
  roommate_name: 'Ram' | 'Munna' | 'Suriya' | 'Kaushik';
  created_at: string;
}

export interface DBExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  paid_by: string;
  receipt_image?: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface DBExpenseApproval {
  id: string;
  expense_id: string;
  user_id: string;
  created_at: string;
}

export interface DBWashingMachine {
  id: string;
  user_id: string | null;
  start_time: string | null;
  end_time: string | null;
  is_active: boolean;
}

export interface DBParkingSpot {
  id: string;
  spot_number: number;
  user_id: string | null;
  vehicle_info?: string;
  is_occupied: boolean;
}

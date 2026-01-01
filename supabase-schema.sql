-- Supabase Schema for Three Idiots Expense Manager
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (linked to Clerk auth)
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  roommate_name TEXT NOT NULL CHECK (roommate_name IN ('Ram', 'Munna', 'Suriya', 'Kaushik')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  paid_by UUID REFERENCES users(id) ON DELETE CASCADE,
  receipt_image TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense approvals table
CREATE TABLE expense_approvals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(expense_id, user_id)
);

-- Washing machine table
CREATE TABLE washing_machine (
  id TEXT PRIMARY KEY DEFAULT '1',
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT false
);

-- Insert default washing machine row
INSERT INTO washing_machine (id, is_active) VALUES ('1', false) ON CONFLICT (id) DO NOTHING;

-- Parking spots table
CREATE TABLE parking_spots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  spot_number INTEGER UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  vehicle_info TEXT,
  is_occupied BOOLEAN DEFAULT false
);

-- Insert default parking spots
INSERT INTO parking_spots (id, spot_number, is_occupied) VALUES
  (uuid_generate_v4(), 1, false),
  (uuid_generate_v4(), 2, false),
  (uuid_generate_v4(), 3, false),
  (uuid_generate_v4(), 4, false)
ON CONFLICT (spot_number) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE washing_machine ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (true);

-- Policies for expenses table
CREATE POLICY "Expenses are viewable by everyone" ON expenses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert expenses" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update expenses" ON expenses FOR UPDATE USING (true);

-- Policies for expense_approvals table
CREATE POLICY "Approvals are viewable by everyone" ON expense_approvals FOR SELECT USING (true);
CREATE POLICY "Anyone can insert approvals" ON expense_approvals FOR INSERT WITH CHECK (true);

-- Policies for washing_machine table
CREATE POLICY "Washing machine is viewable by everyone" ON washing_machine FOR SELECT USING (true);
CREATE POLICY "Anyone can update washing machine" ON washing_machine FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert washing machine" ON washing_machine FOR INSERT WITH CHECK (true);

-- Policies for parking_spots table
CREATE POLICY "Parking spots are viewable by everyone" ON parking_spots FOR SELECT USING (true);
CREATE POLICY "Anyone can update parking spots" ON parking_spots FOR UPDATE USING (true);

-- ============================================
-- Tuition Fees Tracker — Database Setup
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  class TEXT DEFAULT '',
  monthly_fee INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create fee_payments table
CREATE TABLE IF NOT EXISTS fee_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  amount INTEGER NOT NULL DEFAULT 0,
  paid_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, month, year)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_teacher_id ON fee_payments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_month_year ON fee_payments(month, year);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student_id ON fee_payments(student_id);

-- 4. Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for students
CREATE POLICY "Teachers can view their own students"
  ON students FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert their own students"
  ON students FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own students"
  ON students FOR UPDATE
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own students"
  ON students FOR DELETE
  USING (auth.uid() = teacher_id);

-- 6. RLS Policies for fee_payments
CREATE POLICY "Teachers can view their own fee payments"
  ON fee_payments FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert their own fee payments"
  ON fee_payments FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own fee payments"
  ON fee_payments FOR UPDATE
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own fee payments"
  ON fee_payments FOR DELETE
  USING (auth.uid() = teacher_id);

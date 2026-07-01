-- Migration: Genesis Standalone Bus Booking Database Schema
-- Target: Supabase Remote / Local Postgres Database

-- 1. Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    bus_id TEXT NOT NULL,
    bus_reg TEXT NOT NULL,
    bus_class TEXT NOT NULL,
    route_from TEXT NOT NULL,
    route_to TEXT NOT NULL,
    travel_date DATE NOT NULL,
    departure_time TEXT NOT NULL,
    seats JSONB NOT NULL, -- Array of seats e.g., ["1A", "1B"]
    passengers JSONB NOT NULL, -- Array of passenger details e.g., [{"name": "Name", "passport": "ID", "gender": "M", "nationality": "ZW", "dob": "1990-01-01"}]
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    service_fee DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    luggage_info JSONB DEFAULT '{"bags": 0, "fee": 0}'::jsonb NOT NULL, -- Bags quantity & excess fee details
    payment_details JSONB DEFAULT '{"status": "PAID", "ref": "", "gateway": "simulated"}'::jsonb NOT NULL, -- Transaction tracking details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- Maps to auth.users.id
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    preferred_currency TEXT DEFAULT 'USD' NOT NULL,
    saved_passengers JSONB DEFAULT '[]'::jsonb NOT NULL, -- Array of saved passenger cards
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Create Schedules Table (dynamic routes & timetables)
CREATE TABLE IF NOT EXISTS public.schedules (
    id TEXT PRIMARY KEY,
    bus_id TEXT NOT NULL,
    route_from TEXT NOT NULL,
    route_to TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    price_usd DECIMAL(10,2) NOT NULL,
    travel_days JSONB DEFAULT '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]'::jsonb NOT NULL
);

-- Seed Schedules Data
INSERT INTO public.schedules (id, bus_id, route_from, route_to, departure_time, price_usd, travel_days)
VALUES 
  ('SCH-001', 'G-401', 'Harare', 'Bulawayo', '08:00 AM', 15.00, '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]'),
  ('SCH-002', 'G-402', 'Harare', 'Mutare', '10:30 AM', 10.00, '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]'),
  ('SCH-003', 'G-403', 'Bulawayo', 'Beit Bridge', '06:00 AM', 12.00, '["Monday", "Wednesday", "Friday", "Sunday"]'),
  ('SCH-004', 'G-401', 'Bulawayo', 'Harare', '02:00 PM', 15.00, '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]'),
  ('SCH-002D', 'G-402', 'Mutare', 'Harare', '03:30 PM', 10.00, '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]'),
  ('SCH-003D', 'G-403', 'Beit Bridge', 'Bulawayo', '01:00 PM', 12.00, '["Monday", "Wednesday", "Friday", "Sunday"]'),
  ('SCH-005', 'G-404', 'Johannesburg', 'Bulawayo', '04:00 PM', 35.00, '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]'),
  ('SCH-005D', 'G-404', 'Bulawayo', 'Johannesburg', '06:00 AM', 35.00, '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]')
ON CONFLICT (id) DO UPDATE 
SET 
  bus_id = EXCLUDED.bus_id,
  route_from = EXCLUDED.route_from,
  route_to = EXCLUDED.route_to,
  departure_time = EXCLUDED.departure_time,
  price_usd = EXCLUDED.price_usd,
  travel_days = EXCLUDED.travel_days;

-- 4. Create Fleet Tracking Table
CREATE TABLE IF NOT EXISTS public.fleet_tracking (
    bus_id TEXT PRIMARY KEY,
    travel_date DATE NOT NULL,
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    speed_kmh DECIMAL(5,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. Create App Settings Table
CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Seed initial settings
INSERT INTO public.app_settings (id, settings)
VALUES ('global', '{"enable_live_map": true}')
ON CONFLICT (id) DO NOTHING;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 7. Row Level Security Policies

-- Bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON public.bookings;
CREATE POLICY "Enable insert access for all users" ON public.bookings FOR INSERT WITH CHECK (true);

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Enable insert for authenticated users on signup" ON public.profiles;
CREATE POLICY "Enable insert for authenticated users on signup" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Schedules
DROP POLICY IF EXISTS "Enable read access for all users" ON public.schedules;
CREATE POLICY "Enable read access for all users" ON public.schedules FOR SELECT USING (true);

-- Fleet Tracking
DROP POLICY IF EXISTS "Enable read access for tracking" ON public.fleet_tracking;
CREATE POLICY "Enable read access for tracking" ON public.fleet_tracking FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable upsert for tracking" ON public.fleet_tracking;
CREATE POLICY "Enable upsert for tracking" ON public.fleet_tracking FOR ALL USING (true) WITH CHECK (true);

-- App Settings
DROP POLICY IF EXISTS "Enable read access for settings" ON public.app_settings;
CREATE POLICY "Enable read access for settings" ON public.app_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable update for settings" ON public.app_settings;
CREATE POLICY "Enable update for settings" ON public.app_settings FOR UPDATE USING (true);

-- Support Tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    issue_type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'OPEN' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all support" ON public.support_tickets;
CREATE POLICY "Enable read access for all support" ON public.support_tickets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all support" ON public.support_tickets;
CREATE POLICY "Enable insert access for all support" ON public.support_tickets FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all support" ON public.support_tickets;
CREATE POLICY "Enable update access for all support" ON public.support_tickets FOR UPDATE USING (true);

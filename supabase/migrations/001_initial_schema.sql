-- ==============================================================================
-- MSR NEXT GEN TRACKER & MAYA AGI - SUPABASE POSTGRESQL SCHEMA
-- ==============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL,
    role_label TEXT,
    base_salary NUMERIC(10, 2) DEFAULT 15000.00,
    upi_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. ATTENDANCE TABLE (With 200m GKP Office Geofence)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TEXT NOT NULL,
    check_in_lat NUMERIC(10, 6) NOT NULL,
    check_in_lng NUMERIC(10, 6) NOT NULL,
    within_geofence BOOLEAN DEFAULT true,
    distance_meters INTEGER DEFAULT 0,
    status TEXT DEFAULT 'present',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. AMPARO CALLS TABLE (Shopify & Shiprocket Sync & Bolna AI Voice Agent)
CREATE TABLE IF NOT EXISTS public.amparo_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shopify_order_id TEXT,
    shiprocket_shipment_id TEXT,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    product TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    order_date TIMESTAMPTZ DEFAULT now(),
    call_type TEXT DEFAULT 'Order Confirmation',
    status TEXT DEFAULT 'pending_confirmation',
    urgent_rto BOOLEAN DEFAULT false,
    notes TEXT,
    handled_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    -- Bolna AI Calling Telemetry Columns
    call_source TEXT DEFAULT 'telecaller_manual', -- 'ai_agent' | 'telecaller_manual'
    bolna_call_id TEXT,
    call_duration_seconds INTEGER DEFAULT 0,
    recording_url TEXT,
    transcript TEXT,
    ai_summary TEXT,
    ai_decision TEXT, -- 'confirmed' | 'cancelled' | 'rescheduled' | 'no_answer' | 'fake_order'
    cancellation_reason TEXT,
    combo_accepted BOOLEAN DEFAULT false,
    action_required TEXT DEFAULT 'ship_immediately', -- 'ship_immediately' | 'cancel_in_shopify' | 'manual_followup' | 'reschedule_dispatch'
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. MSR LEADS TABLE
CREATE TABLE IF NOT EXISTS public.msr_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sourced_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    lead_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'new',
    converted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    deal_amount NUMERIC(10, 2) DEFAULT 0.00,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. VIDEOS TABLE
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    client_name TEXT NOT NULL,
    type TEXT DEFAULT 'reel',
    status TEXT DEFAULT 'editing',
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. FIELD VISITS TABLE (Gym Shilajit & Client Meetings with GPS Proof)
CREATE TABLE IF NOT EXISTS public.field_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    type TEXT DEFAULT 'gym_silajit',
    name TEXT NOT NULL,
    location TEXT,
    gps_lat NUMERIC(10, 6) NOT NULL,
    gps_lng NUMERIC(10, 6) NOT NULL,
    outcome TEXT,
    amount NUMERIC(10, 2) DEFAULT 0.00,
    payment_status TEXT DEFAULT 'pending',
    payment_mode TEXT DEFAULT 'UPI',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. REVENUE LOG TABLE
CREATE TABLE IF NOT EXISTS public.revenue_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month TEXT NOT NULL,
    total_revenue NUMERIC(12, 2) NOT NULL,
    prev_month_revenue NUMERIC(12, 2) NOT NULL,
    growth_amount NUMERIC(12, 2) NOT NULL,
    bonus_pool_8pct NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. INCENTIVE LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.incentive_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    type TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    related_record_id TEXT,
    paid BOOLEAN DEFAULT false,
    paid_date DATE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. PAYROLL TABLE (Manual UPI One-Tap Settlement)
CREATE TABLE IF NOT EXISTS public.payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    base_salary NUMERIC(10, 2) NOT NULL,
    days_present INTEGER DEFAULT 26,
    attendance_deduction NUMERIC(10, 2) DEFAULT 0.00,
    total_incentives NUMERIC(10, 2) DEFAULT 0.00,
    final_payable NUMERIC(10, 2) NOT NULL,
    payment_link TEXT,
    payment_status TEXT DEFAULT 'pending',
    paid_date DATE,
    utr_number TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 10. MAYA AGI AGENT MEMORIES TABLE
CREATE TABLE IF NOT EXISTS public.agent_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amparo_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.msr_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incentive_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memories ENABLE ROW LEVEL SECURITY;

-- Drop old policies if existing to avoid duplicates
DROP POLICY IF EXISTS "Allow public read access for demo" ON public.users;
DROP POLICY IF EXISTS "Allow public access on attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow public access on calls" ON public.amparo_calls;
DROP POLICY IF EXISTS "Allow public access on leads" ON public.msr_leads;
DROP POLICY IF EXISTS "Allow public access on videos" ON public.videos;
DROP POLICY IF EXISTS "Allow public access on visits" ON public.field_visits;
DROP POLICY IF EXISTS "Allow public access on revenue" ON public.revenue_log;
DROP POLICY IF EXISTS "Allow public access on incentives" ON public.incentive_ledger;
DROP POLICY IF EXISTS "Allow public access on payroll" ON public.payroll;
DROP POLICY IF EXISTS "Allow public access on agent memories" ON public.agent_memories;

-- Create Clean All-Access RLS Policies
CREATE POLICY "Allow public read access for demo" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow public access on attendance" ON public.attendance FOR ALL USING (true);
CREATE POLICY "Allow public access on calls" ON public.amparo_calls FOR ALL USING (true);
CREATE POLICY "Allow public access on leads" ON public.msr_leads FOR ALL USING (true);
CREATE POLICY "Allow public access on videos" ON public.videos FOR ALL USING (true);
CREATE POLICY "Allow public access on visits" ON public.field_visits FOR ALL USING (true);
CREATE POLICY "Allow public access on revenue" ON public.revenue_log FOR ALL USING (true);
CREATE POLICY "Allow public access on incentives" ON public.incentive_ledger FOR ALL USING (true);
CREATE POLICY "Allow public access on payroll" ON public.payroll FOR ALL USING (true);
CREATE POLICY "Allow public access on agent memories" ON public.agent_memories FOR ALL USING (true);

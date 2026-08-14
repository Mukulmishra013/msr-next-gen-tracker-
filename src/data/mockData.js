// Real Agency Data Store - Initialized with Super Admin Mukul Mishra

export const INITIAL_REAL_USERS = [
  {
    id: 'usr_admin_mukul',
    firebase_uid: 'fb_mukul_8887521156',
    name: 'Mukul Mishra',
    phone: '+918887521156',
    email: 'Mukulmishr8887521156@gmail.com',
    role: 'owner',
    roleLabel: 'Agency Director & Super Admin',
    avatar: '👑',
    base_salary: 0,
    upi_id: '8887521156@upi',
    streak: 1
  }
];

export const MOCK_USERS = INITIAL_REAL_USERS;
export const MOCK_AMPARO_CALLS = [];
export const MOCK_MSR_LEADS = [];
export const MOCK_VIDEOS = [];
export const MOCK_FIELD_VISITS = [];
export const MOCK_ATTENDANCE = [];
export const MOCK_INCENTIVES = [];
export const MOCK_PAYROLL = [];

export const MOCK_REVENUE_LOG = {
  id: 'rev_current',
  month: 'August 2026',
  total_revenue: 0,
  prev_month_revenue: 0,
  growth_amount: 0,
  bonus_pool_8pct: 0,
  split_count: 1,
  bonus_per_member: 0
};

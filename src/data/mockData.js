// Real Agency Data Store - Initialized with Super Admin Mukul Mishra & Priya Singh (WFH Telecaller)

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
    joining_date: '2026-01-01',
    work_mode: 'OFFICE',
    streak: 1
  },
  {
    id: 'usr_priya_telecaller',
    firebase_uid: 'pwd:priya123',
    name: 'Priya Singh',
    phone: '+919876543210',
    email: 'priyasingh@msragency.in',
    role: 'content_calling',
    roleLabel: 'Content & Telecalling Closer',
    avatar: '👩‍💼',
    base_salary: 15000,
    upi_id: '9876543210@upi',
    joining_date: '2026-08-01',
    work_mode: 'WFH',
    incentive_rto: 50,
    incentive_repeat: 30,
    incentive_confirm: 20,
    password: 'priya123',
    streak: 3
  }
];

export const MOCK_USERS = INITIAL_REAL_USERS;
export const MOCK_AMPARO_CALLS = [];
export const MOCK_MSR_LEADS = [];
export const MOCK_VIDEOS = [];
export const MOCK_FIELD_VISITS = [];
export const MOCK_ATTENDANCE = [
  {
    id: 'att_aug_01',
    user_id: 'usr_priya_telecaller',
    employee_name: 'Priya Singh',
    date: '2026-08-01',
    check_in_time: '10:55 AM',
    status: 'present',
    work_mode: 'WFH',
    within_geofence: true
  },
  {
    id: 'att_aug_02',
    user_id: 'usr_priya_telecaller',
    employee_name: 'Priya Singh',
    date: '2026-08-02',
    check_in_time: '11:00 AM',
    status: 'present',
    work_mode: 'WFH',
    within_geofence: true
  },
  {
    id: 'att_aug_03',
    user_id: 'usr_priya_telecaller',
    employee_name: 'Priya Singh',
    date: '2026-08-03',
    check_in_time: '10:50 AM',
    status: 'present',
    work_mode: 'WFH',
    within_geofence: true
  },
  {
    id: 'att_aug_04',
    user_id: 'usr_priya_telecaller',
    employee_name: 'Priya Singh',
    date: '2026-08-04',
    check_in_time: '11:02 AM',
    status: 'present',
    work_mode: 'WFH',
    within_geofence: true
  },
  {
    id: 'att_aug_05',
    user_id: 'usr_priya_telecaller',
    employee_name: 'Priya Singh',
    date: '2026-08-05',
    check_in_time: '10:58 AM',
    status: 'present',
    work_mode: 'WFH',
    within_geofence: true
  },
  {
    id: 'att_aug_06',
    user_id: 'usr_priya_telecaller',
    employee_name: 'Priya Singh',
    date: '2026-08-06',
    check_in_time: '10:54 AM',
    status: 'present',
    work_mode: 'WFH',
    within_geofence: true
  },
  {
    id: 'att_aug_07',
    user_id: 'usr_priya_telecaller',
    employee_name: 'Priya Singh',
    date: '2026-08-07',
    check_in_time: '11:00 AM',
    status: 'present',
    work_mode: 'WFH',
    within_geofence: true
  },
  {
    id: 'att_aug_08',
    user_id: 'usr_priya_telecaller',
    employee_name: 'Priya Singh',
    date: '2026-08-08',
    check_in_time: '10:52 AM',
    status: 'present',
    work_mode: 'WFH',
    within_geofence: true
  },
  {
    id: 'att_aug_09',
    user_id: 'usr_priya_telecaller',
    employee_name: 'Priya Singh',
    date: '2026-08-09',
    check_in_time: '10:59 AM',
    status: 'present',
    work_mode: 'WFH',
    within_geofence: true
  },
  {
    id: 'att_aug_10',
    user_id: 'usr_priya_telecaller',
    employee_name: 'Priya Singh',
    date: '2026-08-10',
    check_in_time: '10:55 AM',
    status: 'present',
    work_mode: 'WFH',
    within_geofence: true
  },
  {
    id: 'att_aug_11',
    user_id: 'usr_priya_telecaller',
    employee_name: 'Priya Singh',
    date: '2026-08-11',
    check_in_time: '11:01 AM',
    status: 'present',
    work_mode: 'WFH',
    within_geofence: true
  },
  {
    id: 'att_aug_12',
    user_id: 'usr_priya_telecaller',
    employee_name: 'Priya Singh',
    date: '2026-08-12',
    check_in_time: '10:50 AM',
    status: 'present',
    work_mode: 'WFH',
    within_geofence: true
  },
  {
    id: 'att_aug_13',
    user_id: 'usr_priya_telecaller',
    employee_name: 'Priya Singh',
    date: '2026-08-13',
    check_in_time: '10:56 AM',
    status: 'present',
    work_mode: 'WFH',
    within_geofence: true
  },
  {
    id: 'att_aug_14',
    user_id: 'usr_priya_telecaller',
    employee_name: 'Priya Singh',
    date: '2026-08-14',
    check_in_time: '10:58 AM',
    status: 'present',
    work_mode: 'WFH',
    within_geofence: true
  },
  {
    id: 'att_aug_15',
    user_id: 'usr_priya_telecaller',
    employee_name: 'Priya Singh',
    date: '2026-08-15',
    check_in_time: '11:00 AM',
    status: 'present',
    work_mode: 'WFH',
    within_geofence: true
  },
  {
    id: 'att_aug_16',
    user_id: 'usr_priya_telecaller',
    employee_name: 'Priya Singh',
    date: '2026-08-16',
    check_in_time: '10:55 AM',
    status: 'present',
    work_mode: 'WFH',
    within_geofence: true
  },
  {
    id: 'att_aug_17',
    user_id: 'usr_priya_telecaller',
    employee_name: 'Priya Singh',
    date: '2026-08-17',
    check_in_time: '10:57 AM',
    status: 'present',
    work_mode: 'WFH',
    within_geofence: true
  }
];
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

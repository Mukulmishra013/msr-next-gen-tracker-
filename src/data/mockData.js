// Initial Comprehensive Mock Dataset for Offline & Instant Testing

export const MOCK_USERS = [
  {
    id: 'usr_cc_1',
    firebase_uid: 'fb_cc_101',
    name: 'Rahul Sharma',
    phone: '+919876543210',
    role: 'content_calling',
    roleLabel: 'Telecaller & Amparo Lead',
    avatar: '📞',
    base_salary: 15000,
    upi_id: 'rahul.msr@okaxis',
    streak: 7
  },
  {
    id: 'usr_ed_2',
    firebase_uid: 'fb_ed_102',
    name: 'Aman Verma',
    phone: '+919876543211',
    role: 'editor_leads',
    roleLabel: 'Video Editor & Lead Scout',
    avatar: '🎬',
    base_salary: 16000,
    upi_id: 'aman.editor@paytm',
    streak: 12
  },
  {
    id: 'usr_fe_3',
    firebase_uid: 'fb_fe_103',
    name: 'Rohit Singh',
    phone: '+919876543212',
    role: 'field_executive',
    roleLabel: 'Field Executive & Gym Lead',
    avatar: '🛵',
    base_salary: 14000,
    upi_id: 'rohit.singh@ybl',
    streak: 9
  },
  {
    id: 'usr_own_0',
    firebase_uid: 'fb_own_000',
    name: 'Saurabh MSR (Owner)',
    phone: '+919876500000',
    role: 'owner',
    roleLabel: 'Agency Owner & Director',
    avatar: '👑',
    base_salary: 0,
    upi_id: 'saurabh.director@okicici',
    streak: 30
  }
];

export const MOCK_AMPARO_CALLS = [
  {
    id: 'amp_101',
    shopify_order_id: '#AMP-8921',
    shiprocket_shipment_id: 'SR-8841029',
    customer_name: 'Vikas Dubey',
    phone: '+919823451290',
    product: 'Amparo Pure Himalayan Shilajit (30g)',
    amount: 1499,
    order_date: '2026-08-14 10:15 AM',
    call_type: 'RTO Rescue',
    status: 'pending_confirmation',
    urgent_rto: true, // Urgent red flag at top
    notes: 'Customer refused door delivery yesterday. Re-attempt call needed.',
    handled_by: 'usr_cc_1'
  },
  {
    id: 'amp_102',
    shopify_order_id: '#AMP-8924',
    shiprocket_shipment_id: 'SR-8841105',
    customer_name: 'Ankit Mishra',
    phone: '+919712398450',
    product: 'Amparo Organic Ashwagandha Gold',
    amount: 999,
    order_date: '2026-08-14 11:30 AM',
    call_type: 'Order Confirmation',
    status: 'pending_confirmation',
    urgent_rto: false,
    notes: 'Prepaid order, address verification pending.',
    handled_by: 'usr_cc_1'
  },
  {
    id: 'amp_103',
    shopify_order_id: '#AMP-8910',
    shiprocket_shipment_id: 'SR-8839002',
    customer_name: 'Pooja Tiwari',
    phone: '+919650023419',
    product: 'Amparo Shilajit Resin + Stamina Booster Pack',
    amount: 2499,
    order_date: '2026-08-13 04:45 PM',
    call_type: 'RTO Rescue',
    status: 'rto_saved',
    urgent_rto: false,
    notes: 'Address corrected with landmark near Medical College. Re-delivery scheduled.',
    handled_by: 'usr_cc_1'
  },
  {
    id: 'amp_104',
    shopify_order_id: '#AMP-8902',
    shiprocket_shipment_id: 'SR-8837761',
    customer_name: 'Ramesh Maurya',
    phone: '+919451209384',
    product: 'Amparo Pure Himalayan Shilajit (50g)',
    amount: 2199,
    order_date: '2026-08-12 02:20 PM',
    call_type: 'Order Confirmation',
    status: 'confirmed',
    urgent_rto: false,
    notes: 'Confirmed on WhatsApp call.',
    handled_by: 'usr_cc_1'
  }
];

export const MOCK_MSR_LEADS = [
  {
    id: 'lead_201',
    sourced_by: 'usr_ed_2',
    lead_name: 'Gym Plus Gorakhpur (Anand Gupta)',
    phone: '+919918234110',
    date: '2026-08-14',
    status: 'new',
    converted_by: null,
    deal_amount: 18000,
    category: 'Social Media Management'
  },
  {
    id: 'lead_202',
    sourced_by: 'usr_ed_2',
    lead_name: 'Royal Cafe & Lounge Mohaddipur',
    phone: '+919839012344',
    date: '2026-08-14',
    status: 'contacted',
    converted_by: null,
    deal_amount: 25000,
    category: 'Reels Shoot & Ads'
  },
  {
    id: 'lead_203',
    sourced_by: 'usr_ed_2',
    lead_name: 'Dr. Srivastava Dental Clinic',
    phone: '+919415087612',
    date: '2026-08-13',
    status: 'converted',
    converted_by: 'usr_cc_1',
    deal_amount: 22000,
    category: 'Google Ads & Lead Gen'
  }
];

export const MOCK_VIDEOS = [
  {
    id: 'vid_301',
    user_id: 'usr_ed_2',
    date: '2026-08-14',
    client_name: 'Amparo Shilajit Brand',
    type: 'reel',
    status: 'editing',
    link: 'https://drive.google.com/file/d/amparo-reel-draft1'
  },
  {
    id: 'vid_302',
    user_id: 'usr_ed_2',
    date: '2026-08-14',
    client_name: 'Gym Plus Promo Video',
    type: 'short',
    status: 'done',
    link: 'https://instagram.com/reel/C892189'
  },
  {
    id: 'vid_303',
    user_id: 'usr_ed_2',
    date: '2026-08-13',
    client_name: 'MSR Next Gen Agency Reel',
    type: 'fb_video',
    status: 'posted',
    link: 'https://facebook.com/watch?v=990182'
  }
];

export const MOCK_FIELD_VISITS = [
  {
    id: 'fld_401',
    user_id: 'usr_fe_3',
    date: '2026-08-14',
    type: 'gym_silajit',
    name: 'Iron Muscle Gym (Golghar)',
    location: 'Golghar Market, Gorakhpur',
    gps_lat: 26.7588,
    gps_lng: 83.3756,
    outcome: '12 Bottles Stock Delivered & Cash Received',
    amount: 10800,
    payment_status: 'received',
    payment_mode: 'Cash'
  },
  {
    id: 'fld_402',
    user_id: 'usr_fe_3',
    date: '2026-08-14',
    type: 'msr_client',
    name: 'Shree Krishna Sweets & Bakery',
    location: 'Betiahata, Gorakhpur',
    gps_lat: 26.7490,
    gps_lng: 83.3680,
    outcome: 'Proposal pitch completed, owner asked for quotation on WhatsApp',
    amount: 30000,
    payment_status: 'pending',
    payment_mode: 'UPI'
  }
];

export const MOCK_ATTENDANCE = [
  {
    id: 'att_501',
    user_id: 'usr_cc_1',
    userName: 'Rahul Sharma',
    role: 'content_calling',
    date: '2026-08-14',
    check_in_time: '09:42 AM',
    check_in_lat: 26.7607,
    check_in_lng: 83.3731,
    within_geofence: true,
    distance_meters: 15,
    status: 'present'
  },
  {
    id: 'att_502',
    user_id: 'usr_ed_2',
    userName: 'Aman Verma',
    role: 'editor_leads',
    date: '2026-08-14',
    check_in_time: '09:55 AM',
    check_in_lat: 26.7602,
    check_in_lng: 83.3734,
    within_geofence: true,
    distance_meters: 48,
    status: 'present'
  },
  {
    id: 'att_503',
    user_id: 'usr_fe_3',
    userName: 'Rohit Singh',
    role: 'field_executive',
    date: '2026-08-14',
    check_in_time: '10:05 AM',
    check_in_lat: 26.7588,
    check_in_lng: 83.3756,
    within_geofence: true, // Field role has GPS-proof attached
    distance_meters: 0,
    status: 'present'
  }
];

export const MOCK_REVENUE_LOG = {
  id: 'rev_601',
  month: 'August 2026',
  total_revenue: 350000,
  prev_month_revenue: 270000,
  growth_amount: 80000,
  bonus_pool_8pct: 6400, // 8% of 80,000 growth
  split_count: 3,
  bonus_per_member: 2133
};

export const MOCK_INCENTIVES = [
  {
    id: 'inc_701',
    user_id: 'usr_cc_1',
    userName: 'Rahul Sharma',
    month: 'August 2026',
    type: 'msr_deal',
    amount: 400,
    title: 'Dr. Srivastava Clinic Conversion',
    paid: false
  },
  {
    id: 'inc_702',
    user_id: 'usr_cc_1',
    userName: 'Rahul Sharma',
    month: 'August 2026',
    type: 'amparo_conversion',
    amount: 350,
    title: '3 Amparo Prepaid Conversions (3%)',
    paid: false
  },
  {
    id: 'inc_703',
    user_id: 'usr_ed_2',
    userName: 'Aman Verma',
    month: 'August 2026',
    type: 'growth_bonus',
    amount: 2133,
    title: 'August Agency 8% Growth Bonus Share',
    paid: false
  },
  {
    id: 'inc_704',
    user_id: 'usr_fe_3',
    userName: 'Rohit Singh',
    month: 'August 2026',
    type: 'amparo_gym_sale',
    amount: 800,
    title: 'Gym Silajit Batch Delivery Commission',
    paid: false
  }
];

export const MOCK_PAYROLL = [
  {
    id: 'pay_801',
    user_id: 'usr_cc_1',
    name: 'Rahul Sharma',
    role: 'content_calling',
    roleLabel: 'Telecaller & Amparo',
    month: 'August 2026',
    base_salary: 15000,
    days_present: 24,
    total_working_days: 26,
    attendance_deduction: 0,
    total_incentives: 2883,
    final_payable: 17883,
    upi_id: 'rahul.msr@okaxis',
    payment_status: 'pending',
    paid_date: null,
    utr_number: null
  },
  {
    id: 'pay_802',
    user_id: 'usr_ed_2',
    name: 'Aman Verma',
    role: 'editor_leads',
    roleLabel: 'Video Editor & Scout',
    month: 'August 2026',
    base_salary: 16000,
    days_present: 25,
    total_working_days: 26,
    attendance_deduction: 0,
    total_incentives: 3133,
    final_payable: 19133,
    upi_id: 'aman.editor@paytm',
    payment_status: 'pending',
    paid_date: null,
    utr_number: null
  },
  {
    id: 'pay_803',
    user_id: 'usr_fe_3',
    name: 'Rohit Singh',
    role: 'field_executive',
    roleLabel: 'Field Executive',
    month: 'August 2026',
    base_salary: 14000,
    days_present: 26,
    total_working_days: 26,
    attendance_deduction: 0,
    total_incentives: 2933,
    final_payable: 16933,
    upi_id: 'rohit.singh@ybl',
    payment_status: 'pending',
    paid_date: null,
    utr_number: null
  }
];

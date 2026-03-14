// ═══════════════════════════════════════════════
// KAVYA INFOWEB CRM — SAMPLE DATA
// ═══════════════════════════════════════════════

export const LEADS_DATA = [
  { id:1, name:'Rahul Mehta',     phone:'+91 98765 43210', email:'rahul@techsoft.in',    company:'TechSoft Pvt Ltd',      source:'REFERRAL',       status:'QUALIFIED', agent:'Ananya Rao',    initials:'AR', score:78, deal:240000, city:'Mumbai',    createdAt:'Mar 1, 2025' },
  { id:2, name:'Priya Sharma',    phone:'+91 87654 32109', email:'priya@designco.com',   company:'DesignCo Studios',      source:'WEBSITE',        status:'FOLLOW_UP', agent:'Ravi Patel',    initials:'RP', score:62, deal:120000, city:'Pune',      createdAt:'Feb 28, 2025' },
  { id:3, name:'Sunita Verma',    phone:'+91 76543 21098', email:'sunita@infra.in',      company:'Infra Solutions Ltd',   source:'COLD_CALL',      status:'CONTACTED', agent:'Sneha Kumar',   initials:'SK', score:45, deal:85000,  city:'Bangalore', createdAt:'Feb 26, 2025' },
  { id:4, name:'Mohan Das',       phone:'+91 65432 10987', email:'mohan@logistics.com',  company:'FastMove Logistics',    source:'SOCIAL_MEDIA',   status:'NEW',       agent:'Mohan K.',      initials:'MK', score:31, deal:55000,  city:'Chennai',   createdAt:'Mar 2, 2025' },
  { id:5, name:'Kavita Singh',    phone:'+91 54321 09876', email:'kavita@retail.in',     company:'Metro Retail Pvt Ltd',  source:'EMAIL_CAMPAIGN', status:'CLOSED',    agent:'Ananya Rao',    initials:'AR', score:92, deal:380000, city:'Delhi',     createdAt:'Feb 20, 2025' },
  { id:6, name:'Arjun Nair',      phone:'+91 43210 98765', email:'arjun@fintech.io',     company:'FinEdge Technologies',  source:'REFERRAL',       status:'QUALIFIED', agent:'Ravi Patel',    initials:'RP', score:71, deal:195000, city:'Hyderabad', createdAt:'Feb 22, 2025' },
  { id:7, name:'Deepika Pillai',  phone:'+91 32109 87654', email:'deepika@health.in',    company:'HealthFirst Clinics',   source:'WEBSITE',        status:'NEW',       agent:'Sneha Kumar',   initials:'SK', score:38, deal:75000,  city:'Kochi',     createdAt:'Mar 3, 2025' },
  { id:8, name:'Vikram Agarwal',  phone:'+91 21098 76543', email:'vikram@manuf.com',     company:'Agarwal Manufacturing', source:'TRADE_SHOW',     status:'FOLLOW_UP', agent:'Ananya Rao',    initials:'AR', score:55, deal:310000, city:'Ahmedabad', createdAt:'Feb 18, 2025' },
  { id:9, name:'Rekha Joshi',     phone:'+91 10987 65432', email:'rekha@edu.in',         company:'BrightMinds Academy',   source:'COLD_CALL',      status:'CONTACTED', agent:'Ravi Patel',    initials:'RP', score:49, deal:65000,  city:'Jaipur',    createdAt:'Mar 4, 2025' },
  { id:10,name:'Suresh Gupta',    phone:'+91 99887 76655', email:'suresh@pharma.in',     company:'MediCare Pharma',       source:'WEBSITE',        status:'CLOSED',    agent:'Ananya Rao',    initials:'AR', score:88, deal:450000, city:'Surat',     createdAt:'Feb 15, 2025' },
  { id:11,name:'Lakshmi Iyer',    phone:'+91 88776 65544', email:'lakshmi@auto.com',     company:'AutoDrive Motors',      source:'REFERRAL',       status:'NEW',       agent:'Sneha Kumar',   initials:'SK', score:34, deal:95000,  city:'Pune',      createdAt:'Mar 5, 2025' },
  { id:12,name:'Kiran Reddy',     phone:'+91 77665 54433', email:'kiran@realty.in',      company:'SkyHigh Realtors',      source:'SOCIAL_MEDIA',   status:'QUALIFIED', agent:'Mohan K.',      initials:'MK', score:67, deal:520000, city:'Hyderabad', createdAt:'Feb 25, 2025' },
];

export const TASKS_DATA = [
  { id:1, title:'Demo call with ABC Corp',             lead:'Rahul Mehta',    leadId:1, agent:'Ananya Rao',  initials:'AR', due:'Mar 6, 2025',  priority:'URGENT', status:'PENDING',     type:'CALL',     desc:'Show enterprise CRM features to the management team.' },
  { id:2, title:'Send proposal to XYZ Industries',     lead:'Priya Sharma',   leadId:2, agent:'Ravi Patel',  initials:'RP', due:'Mar 7, 2025',  priority:'HIGH',   status:'IN_PROGRESS', type:'EMAIL',    desc:'Tailored proposal for DesignCo with pricing.' },
  { id:3, title:'Follow up with Sunita Verma',         lead:'Sunita Verma',   leadId:3, agent:'Sneha Kumar', initials:'SK', due:'Mar 8, 2025',  priority:'MEDIUM', status:'PENDING',     type:'CALL',     desc:'Check on proposal feedback.' },
  { id:4, title:'Update CRM with meeting notes',       lead:'—',              leadId:0, agent:'Mohan K.',    initials:'MK', due:'Mar 9, 2025',  priority:'LOW',    status:'PENDING',     type:'OTHER',    desc:'Post-meeting documentation.' },
  { id:5, title:'Prepare Q1 Sales Report',             lead:'—',              leadId:0, agent:'Ananya Rao',  initials:'AR', due:'Mar 10, 2025', priority:'HIGH',   status:'IN_PROGRESS', type:'OTHER',    desc:'Compile Q1 data from all agents.' },
  { id:6, title:'Product demo for FinEdge',            lead:'Arjun Nair',     leadId:6, agent:'Ravi Patel',  initials:'RP', due:'Mar 11, 2025', priority:'MEDIUM', status:'PENDING',     type:'DEMO',     desc:'Full product walkthrough.' },
  { id:7, title:'Contract review — MediCare',          lead:'Suresh Gupta',   leadId:10,agent:'Ananya Rao',  initials:'AR', due:'Mar 5, 2025',  priority:'URGENT', status:'COMPLETED',   type:'MEETING',  desc:'Legal review before signing.' },
  { id:8, title:'Onboarding call — Kavita Singh',      lead:'Kavita Singh',   leadId:5, agent:'Sneha Kumar', initials:'SK', due:'Mar 4, 2025',  priority:'HIGH',   status:'COMPLETED',   type:'CALL',     desc:'Post-deal onboarding session.' },
];

export const PROJECTS_DATA = [
  { id:1, name:'CRM Implementation — TechSoft',          client:'TechSoft Pvt Ltd',      budget:500000,  start:'Feb 1, 2025',  end:'Apr 30, 2025', status:'IN_PROGRESS', leader:'Ananya Rao',  li:'AR', team:['AR','RP','SK'], progress:65, desc:'Full CRM deployment with custom workflows.' },
  { id:2, name:'Sales Automation — FinEdge',             client:'FinEdge Technologies',   budget:350000,  start:'Mar 1, 2025',  end:'May 31, 2025', status:'ACTIVE',      leader:'Ravi Patel', li:'RP', team:['RP','MK'],       progress:20, desc:'Automate lead scoring and follow-up pipeline.' },
  { id:3, name:'Digital Transformation — Metro',         client:'Metro Retail Pvt Ltd',   budget:800000,  start:'Jan 15, 2025', end:'Mar 15, 2025', status:'COMPLETED',   leader:'Sneha Kumar',li:'SK', team:['SK','AR','RP'],  progress:100,desc:'Complete digital transformation of sales ops.' },
  { id:4, name:'ERP Integration — Agarwal Mfg',          client:'Agarwal Manufacturing',  budget:420000,  start:'Dec 1, 2024',  end:'Feb 28, 2025', status:'ON_HOLD',     leader:'Mohan K.',   li:'MK', team:['MK','SK'],       progress:40, desc:'ERP + CRM integration for manufacturing ops.' },
];

export const PRODUCTS_DATA = [
  { id:1, name:'CRM Enterprise Suite',           sku:'CRM-ENT-001', category:'Software',    price:49999,  gst:18, active:true,  desc:'Full-featured CRM with AI insights.' },
  { id:2, name:'Sales Analytics Dashboard',      sku:'SAD-002',     category:'Analytics',   price:19999,  gst:18, active:true,  desc:'Real-time analytics and reporting.' },
  { id:3, name:'Call Recording Module',          sku:'CRM-003',     category:'Add-on',      price:9999,   gst:18, active:true,  desc:'Twilio-powered call recording.' },
  { id:4, name:'WhatsApp Business Integration',  sku:'WA-INT-004',  category:'Integration', price:14999,  gst:18, active:true,  desc:'WhatsApp API for client messaging.' },
  { id:5, name:'Email Campaign Manager',         sku:'ECM-005',     category:'Marketing',   price:12999,  gst:18, active:false, desc:'Bulk email with templates & tracking.' },
  { id:6, name:'Lead Scoring Engine',            sku:'LSE-006',     category:'AI/ML',       price:24999,  gst:18, active:true,  desc:'ML-powered lead prioritization.' },
];

export const INVOICES_DATA = [
  { id:1, num:'INV-2025-001', customer:'TechSoft Pvt Ltd',      email:'accounts@techsoft.in',   date:'Mar 1, 2025',  due:'Mar 31, 2025', sub:240000, gst:43200,  status:'PAID',    method:'BANK_TRANSFER' },
  { id:2, num:'INV-2025-002', customer:'Metro Retail Pvt Ltd',  email:'finance@metro.in',       date:'Feb 28, 2025', due:'Mar 28, 2025', sub:380000, gst:68400,  status:'PAID',    method:'UPI' },
  { id:3, num:'INV-2025-003', customer:'FinEdge Technologies',  email:'ap@finedge.io',          date:'Mar 3, 2025',  due:'Apr 3, 2025',  sub:195000, gst:35100,  status:'SENT',    method:'' },
  { id:4, num:'INV-2025-004', customer:'Agarwal Manufacturing', email:'billing@agarwal.com',    date:'Feb 15, 2025', due:'Mar 15, 2025', sub:310000, gst:55800,  status:'OVERDUE', method:'' },
  { id:5, num:'INV-2025-005', customer:'BrightMinds Academy',   email:'accounts@brightminds.in',date:'Mar 5, 2025',  due:'Apr 5, 2025',  sub:65000,  gst:11700,  status:'DRAFT',   method:'' },
  { id:6, num:'INV-2025-006', customer:'MediCare Pharma',       email:'finance@medicare.in',    date:'Feb 20, 2025', due:'Mar 20, 2025', sub:450000, gst:81000,  status:'PAID',    method:'CREDIT_CARD' },
];

export const USERS_DATA = [
  { id:1, firstName:'System', lastName:'Admin',    email:'admin@salescrm.com',  phone:'+91 98765 00000', role:'ADMIN',       dept:'Administration', designation:'System Administrator', leads:0,  calls:0,  active:true,  initials:'SA', joinDate:'Jan 1, 2024' },
  { id:2, firstName:'Ananya', lastName:'Rao',      email:'ananya@salescrm.com', phone:'+91 98765 11111', role:'SALES_AGENT', dept:'Sales',          designation:'Senior Sales Executive',leads:42, calls:127,active:true,  initials:'AR', joinDate:'Mar 15, 2024' },
  { id:3, firstName:'Ravi',   lastName:'Patel',    email:'ravi@salescrm.com',   phone:'+91 98765 22222', role:'SALES_AGENT', dept:'Sales',          designation:'Sales Executive',       leads:38, calls:98, active:true,  initials:'RP', joinDate:'Apr 2, 2024' },
  { id:4, firstName:'Sneha',  lastName:'Kumar',    email:'sneha@salescrm.com',  phone:'+91 98765 33333', role:'MANAGER',     dept:'Sales',          designation:'Sales Manager',         leads:29, calls:76, active:true,  initials:'SK', joinDate:'Feb 10, 2024' },
  { id:5, firstName:'Mohan',  lastName:'Krishnan', email:'mohan@salescrm.com',  phone:'+91 98765 44444', role:'SALES_AGENT', dept:'Sales',          designation:'Sales Executive',       leads:21, calls:54, active:false, initials:'MK', joinDate:'May 20, 2024' },
];

export const TARGETS_DATA = [
  { rank:1, agent:'Ananya Rao',    initials:'AR', target:250000, achieved:210000, incentive:21000 },
  { rank:2, agent:'Ravi Patel',    initials:'RP', target:250000, achieved:180000, incentive:14400 },
  { rank:3, agent:'Sneha Kumar',   initials:'SK', target:300000, achieved:174000, incentive:10440 },
  { rank:4, agent:'Mohan Krishnan',initials:'MK', target:200000, achieved:82000,  incentive:0 },
];

export const CALL_LOGS = [
  { id:1, leadId:1, leadName:'Rahul Mehta',  agent:'Ananya Rao', date:'Mar 6, 2025', time:'10:35 AM', duration:'4m 28s', status:'COMPLETED', notes:'Interested in Enterprise plan.' },
  { id:2, leadId:1, leadName:'Rahul Mehta',  agent:'Ananya Rao', date:'Mar 3, 2025', time:'09:15 AM', duration:'2m 10s', status:'COMPLETED', notes:'Follow-up scheduled.' },
  { id:3, leadId:2, leadName:'Priya Sharma', agent:'Ravi Patel',  date:'Mar 4, 2025', time:'02:00 PM', duration:'—',      status:'NO_ANSWER',  notes:'' },
];

export const MESSAGES_DATA = [
  { id:1, leadId:1, leadName:'Rahul Mehta', type:'WHATSAPP', direction:'OUTBOUND', date:'Mar 6, 2025 10:10 AM', content:'Hi Rahul! Please find the proposal attached. Looking forward to your feedback!', status:'READ' },
  { id:2, leadId:1, leadName:'Rahul Mehta', type:'WHATSAPP', direction:'OUTBOUND', date:'Mar 3, 2025 11:00 AM', content:'Hello Rahul! Just checking in on our CRM demo discussion from last week.', status:'DELIVERED' },
  { id:3, leadId:2, leadName:'Priya Sharma',type:'SMS',      direction:'OUTBOUND', date:'Mar 4, 2025 03:00 PM', content:'Hi Priya, your demo is scheduled for tomorrow at 2 PM. Looking forward to it!', status:'SENT' },
];

export const NOTIFICATIONS_DATA = [
  { id:1, title:'New lead assigned', message:'Lakshmi Iyer has been assigned to you.', type:'info',    read:false, time:'10 min ago' },
  { id:2, title:'Task due today',    message:'Demo call with ABC Corp is due today.',  type:'warning', read:false, time:'1 hr ago' },
  { id:3, title:'Target milestone!', message:'You have reached 80% of your monthly target!', type:'success', read:false, time:'3 hrs ago' },
  { id:4, title:'Invoice paid',      message:'INV-2025-001 has been marked as paid.',  type:'success', read:true,  time:'Yesterday' },
];

export const ACTIVITY_FEED = [
  { icon:'📞', bg:'var(--teal-dim)',   title:'Call with',    bold:'Rahul Mehta',   time:'10:35 AM · 4min 28sec' },
  { icon:'✉️', bg:'var(--blue-dim)',   title:'Email sent to',bold:'Priya Sharma',  time:'10:12 AM · Follow-up proposal' },
  { icon:'🤝', bg:'var(--green-dim)',  title:'Deal closed —',bold:'TechSoft Pvt Ltd',time:'09:47 AM · ₹2,40,000' },
  { icon:'💬', bg:'var(--orange-dim)',title:'WhatsApp to',  bold:'Sunita Verma',  time:'09:20 AM · Template: Follow-up' },
  { icon:'✅', bg:'var(--purple-dim)',title:'Task created:',bold:'Demo call',      time:'08:55 AM · Due today' },
];

export const AGENT_PERFORMANCE = [
  { name:'Ananya Rao',    initials:'AR', leads:42, calls:127, closed:12, target:84,  color:'var(--teal)' },
  { name:'Ravi Patel',    initials:'RP', leads:38, calls:98,  closed:9,  target:72,  color:'#3b82f6' },
  { name:'Sneha Kumar',   initials:'SK', leads:29, calls:76,  closed:7,  target:58,  color:'var(--orange)' },
  { name:'Mohan Krishnan',initials:'MK', leads:21, calls:54,  closed:4,  target:41,  color:'var(--red)' },
];

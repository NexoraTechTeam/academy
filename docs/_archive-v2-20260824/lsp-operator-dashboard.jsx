import React, { useState, useMemo } from "react";
import {
  LayoutGrid,
  Users2,
  BookOpen,
  Building2,
  UserCog,
  Award,
  ClipboardCheck,
  Search,
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck,
  PenSquare,
  ChevronRight,
  Mail,
  MoreHorizontal,
  BarChart3,
  Smile,
  X,
  Info,
  Calendar,
  Percent,
  MapPin,
  Briefcase,
  Filter,
  Tag,
  AlertOctagon,
  Video,
  Mic,
  Presentation,
  Upload,
  Check,
  Crown,
  Download,
  FileDown,
  FileCheck,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = {
  paper: "#F4F6FB",
  card: "#FFFFFF",
  ink: "#101B33",
  ink60: "#5B6B85",
  primary: "#2952E3",
  primaryDeep: "#17307D",
  cyan: "#0EA5A0",
  amber: "#D68A1F",
  sage: "#2E9E5B",
  crimson: "#B4402E",
  violet: "#6D5BD0",
  line: "#E3E7F0",
};

// ---------------- Mock data ----------------
const KPIS = {
  activeParticipantsThisMonth: 1284,
  individualCount: 812,
  corporateCount: 472,
  ongoingTrainings: 18,
  certificatesThisMonth: 96,
  pendingReviews: 23,
  cpdCompliance: 78,
  activeCorporateAccounts: 4,
  avgSatisfaction: 4.2,
};

// Revenue: current month is July 2026. Jan–Jul are actual, Aug–Oct are forecast.
const REVENUE_MONTHLY = [
  { month: "Jan", corporate: 55000000, individual: 30000000, forecast: false },
  { month: "Feb", corporate: 62000000, individual: 38000000, forecast: false },
  { month: "Mar", corporate: 70000000, individual: 41000000, forecast: false },
  { month: "Apr", corporate: 65000000, individual: 45000000, forecast: false },
  { month: "May", corporate: 78000000, individual: 50000000, forecast: false },
  { month: "Jun", corporate: 82000000, individual: 55000000, forecast: false },
  { month: "Jul", corporate: 104000000, individual: 80500000, forecast: false },
  { month: "Aug", corporate: 112000000, individual: 84000000, forecast: true },
  { month: "Sep", corporate: 118000000, individual: 87000000, forecast: true },
  { month: "Oct", corporate: 123000000, individual: 90000000, forecast: true },
];

// Two additional revenue streams beyond training sales — membership subscriptions (participants)
// and verifier subscriptions (employers) — often missed if only "training revenue" is tracked.
const REVENUE_STREAMS_THIS_MONTH = {
  trainingSales: REVENUE_MONTHLY[6].corporate + REVENUE_MONTHLY[6].individual,
  participantMemberships: 18600000, // e.g. ~380 premium members x Rp49,000
  verifierSubscriptions: 12500000, // e.g. 25 verifier accounts x avg Rp500,000
};
const totalRevenueThisMonth = REVENUE_STREAMS_THIS_MONTH.trainingSales + REVENUE_STREAMS_THIS_MONTH.participantMemberships + REVENUE_STREAMS_THIS_MONTH.verifierSubscriptions;

const revenueThisMonth = REVENUE_MONTHLY[6].corporate + REVENUE_MONTHLY[6].individual;
const revenueNextMonth = REVENUE_MONTHLY[7].corporate + REVENUE_MONTHLY[7].individual;
const revenueNext3Months = REVENUE_MONTHLY.slice(7, 10).reduce((a, m) => a + m.corporate + m.individual, 0);
const revenueYtdActual = REVENUE_MONTHLY.slice(0, 7).reduce((a, m) => a + m.corporate + m.individual, 0);
const revenueYearForecast = revenueYtdActual + revenueNext3Months + 210000000; // + estimated Nov–Dec at trend pace
const corporateYtd = REVENUE_MONTHLY.slice(0, 7).reduce((a, m) => a + m.corporate, 0);
const individualYtd = REVENUE_MONTHLY.slice(0, 7).reduce((a, m) => a + m.individual, 0);

const PARTICIPANTS_YEARLY = [
  { year: "2023", count: 1840 },
  { year: "2024", count: 2350 },
  { year: "2025", count: 2870 },
  { year: "2026 (YTD)", count: 3120 },
];

const ALERTS = [
  { id: 1, text: "12 certificates expire within 60 days — refreshment reminders sent automatically", tone: "amber" },
  { id: 2, text: "5 exams have been awaiting examiner review for more than 5 days", tone: "crimson" },
  { id: 3, text: "PT Sumber Makmur's corporate CPD compliance dropped to 62% this quarter", tone: "amber" },
];

const PARTICIPANTS = [
  { id: 1, name: "Dinda Pramesti", type: "Individual", org: "—", trainings: 5, certs: 3, cpd: "Compliant", lastActive: "Today" },
  { id: 2, name: "Budi Santoso", type: "Corporate", org: "PT Sumber Makmur", trainings: 3, certs: 1, cpd: "At Risk", lastActive: "2 days ago" },
  { id: 3, name: "Rahmat Hidayat", type: "Individual", org: "—", trainings: 4, certs: 2, cpd: "Compliant", lastActive: "Yesterday" },
  { id: 4, name: "Sri Wulandari", type: "Corporate", org: "Bank Nusantara Sejahtera", trainings: 6, certs: 4, cpd: "Compliant", lastActive: "3 days ago" },
  { id: 5, name: "Agus Prabowo", type: "Corporate", org: "PT Sumber Makmur", trainings: 2, certs: 0, cpd: "Non-Compliant", lastActive: "2 weeks ago" },
  { id: 6, name: "Maya Kusuma", type: "Individual", org: "—", trainings: 7, certs: 5, cpd: "Compliant", lastActive: "Today" },
];

const TRAININGS = [
  {
    id: 1,
    title: "Competency Assessor Certification (BNSP)",
    category: "Professional Certification",
    level: "Advanced",
    format: "Blended + Exam",
    duration: "40 hrs · cohort-based",
    price: 4500000,
    cpdHours: 40,
    enrolled: 41,
    seats: 50,
    nextBatch: "Aug 3, 2026",
    status: "published",
    description: "Become a BNSP-registered competency assessor, qualified to design and conduct competency-based assessments.",
    objectives: ["Apply the VARF principles of competency-based assessment", "Design assessment instruments aligned to a unit of competency", "Pass the certification exam, reviewed by a certified examiner"],
    syllabus: [
      { module: "Module 1", title: "Introduction to Competency-Based Assessment", topics: ["What is CBA", "Roles of tutor & examiner"] },
      { module: "Module 2", title: "Designing Assessment Instruments", topics: ["Instrument design", "Evidence sufficiency"] },
      { module: "Final", title: "Certification Final Exam", topics: ["Timed exam", "Examiner review"] },
    ],
    prerequisites: "At least 1 year of relevant professional experience is recommended.",
    audience: "Prospective assessors, HR/L&D staff, and subject-matter experts.",
    relatedTrainings: ["Internal Audit Fundamentals", "ISO 9001:2015 Quality Management"],
  },
  {
    id: 2,
    title: "ISO 9001:2015 Quality Management",
    category: "Professional Certification",
    level: "Intermediate",
    format: "Online + Exam",
    duration: "24 hrs · self-paced",
    price: 3200000,
    cpdHours: 24,
    enrolled: 28,
    seats: 40,
    nextBatch: "Jul 22, 2026",
    status: "published",
    description: "Learn the core requirements of the ISO 9001:2015 quality management standard and how to apply them to real processes.",
    objectives: ["Explain the seven QMS principles", "Interpret the standard's clauses", "Prepare documentation for a certification audit"],
    syllabus: [
      { module: "Module 1", title: "Introduction to QMS", topics: ["History of ISO 9001", "Process approach"] },
      { module: "Module 2", title: "Standard Requirements", topics: ["Context of the organization", "Leadership & planning"] },
    ],
    prerequisites: "No prior ISO experience required.",
    audience: "Quality managers and process owners.",
    relatedTrainings: ["Internal Audit Fundamentals"],
  },
  {
    id: 3,
    title: "2026 H&S Regulation Update",
    category: "Internal · Compliance",
    level: "Beginner",
    format: "Online",
    duration: "4 hrs · self-paced",
    price: 0,
    cpdHours: 4,
    enrolled: 96,
    seats: 150,
    nextBatch: "Jul 29, 2026",
    status: "published",
    description: "A mandatory refresher covering what changed in workplace health & safety regulation this year.",
    objectives: ["Identify key regulatory changes in 2026", "Recognize how the changes affect existing SOPs"],
    syllabus: [{ module: "Module 1", title: "What Changed in 2026", topics: ["Summary of new regulation"] }],
    prerequisites: "None — required for all employees.",
    audience: "All employees.",
    relatedTrainings: [],
  },
  {
    id: 4,
    title: "Internal Audit Fundamentals",
    category: "Professional Certification",
    level: "Intermediate",
    format: "Blended",
    duration: "16 hrs · cohort-based",
    price: 2750000,
    cpdHours: 16,
    enrolled: 19,
    seats: 30,
    nextBatch: "Aug 15, 2026",
    status: "published",
    description: "Build practical internal audit skills — planning, evidence gathering, and writing findings.",
    objectives: ["Plan a risk-based internal audit", "Gather and evaluate audit evidence objectively"],
    syllabus: [{ module: "Module 1", title: "Audit Planning & Risk Assessment", topics: ["Audit scope", "Risk-based planning"] }],
    prerequisites: "Basic understanding of business processes.",
    audience: "Internal auditors and compliance officers.",
    relatedTrainings: ["Advanced Risk-Based Auditing", "Competency Assessor Certification (BNSP)"],
  },
  {
    id: 5,
    title: "Advanced Risk-Based Auditing",
    category: "Professional Certification",
    level: "Advanced",
    format: "Blended",
    duration: "20 hrs · cohort-based",
    price: 3800000,
    cpdHours: 20,
    enrolled: 0,
    seats: 25,
    nextBatch: "TBD",
    status: "draft",
    description: "",
    objectives: [],
    syllabus: [],
    prerequisites: "",
    audience: "",
    relatedTrainings: ["Internal Audit Fundamentals"],
  },
];

const CATEGORY_OPTIONS = ["Professional Certification", "Internal · Compliance", "General Development", "Skill Development"];
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

const CORPORATE_ACCOUNTS = [
  {
    id: 1,
    name: "PT Sumber Makmur",
    industry: "Manufacturing",
    source: "self_registered",
    status: "active",
    employees: 34,
    seatsPurchased: 50,
    seatsUsed: 34,
    cpdCompliance: 62,
    trainingCompliance: 58,
    satisfaction: 3.8,
    avgCompletionDays: 26,
    notStartedPct: 21,
    inProgressPct: 27,
    completedPct: 52,
    manager: "Nadia Iskandar",
    trainingBreakdown: [
      { training: "Competency Assessor Certification (BNSP)", assigned: 10, certsIssued: 6, passed: 5, failed: 1, avgDays: 29 },
      { training: "2026 H&S Regulation Update", assigned: 34, certsIssued: 30, passed: 30, failed: 0, avgDays: 4 },
      { training: "Internal Audit Fundamentals", assigned: 8, certsIssued: 3, passed: 3, failed: 0, avgDays: 24 },
    ],
  },
  {
    id: 2,
    name: "Bank Nusantara Sejahtera",
    industry: "Financial Services",
    source: "self_registered",
    status: "active",
    employees: 58,
    seatsPurchased: 60,
    seatsUsed: 58,
    cpdCompliance: 91,
    trainingCompliance: 89,
    satisfaction: 4.6,
    avgCompletionDays: 14,
    notStartedPct: 6,
    inProgressPct: 15,
    completedPct: 79,
    manager: "Fajar Ramadhan",
    trainingBreakdown: [
      { training: "ISO 9001:2015 Quality Management", assigned: 25, certsIssued: 23, passed: 22, failed: 1, avgDays: 16 },
      { training: "Competency Assessor Certification (BNSP)", assigned: 18, certsIssued: 16, passed: 16, failed: 0, avgDays: 20 },
      { training: "2026 H&S Regulation Update", assigned: 58, certsIssued: 55, passed: 55, failed: 0, avgDays: 3 },
    ],
  },
  {
    id: 3,
    name: "PT Cipta Konstruksi",
    industry: "Construction",
    source: "operator_assigned",
    status: "active",
    employees: 22,
    seatsPurchased: 25,
    seatsUsed: 22,
    cpdCompliance: 74,
    trainingCompliance: 70,
    satisfaction: 4.1,
    avgCompletionDays: 19,
    notStartedPct: 14,
    inProgressPct: 23,
    completedPct: 63,
    manager: "Nadia Iskandar",
    trainingBreakdown: [{ training: "Internal Audit Fundamentals", assigned: 22, certsIssued: 15, passed: 14, failed: 1, avgDays: 19 }],
  },
  {
    id: 4,
    name: "Graha Logistik Indonesia",
    industry: "Logistics",
    source: "self_registered",
    status: "active",
    employees: 15,
    seatsPurchased: 20,
    seatsUsed: 15,
    cpdCompliance: 88,
    trainingCompliance: 92,
    satisfaction: 4.4,
    avgCompletionDays: 11,
    notStartedPct: 5,
    inProgressPct: 10,
    completedPct: 85,
    manager: "Fajar Ramadhan",
    trainingBreakdown: [{ training: "2026 H&S Regulation Update", assigned: 15, certsIssued: 14, passed: 14, failed: 0, avgDays: 3 }],
  },
  {
    id: 5,
    name: "Koperasi Sejahtera Bersama",
    industry: "Cooperative / Finance",
    source: "operator_assigned",
    status: "pending_activation",
    employees: 0,
    seatsPurchased: 15,
    seatsUsed: 0,
    cpdCompliance: 0,
    trainingCompliance: 0,
    satisfaction: null,
    avgCompletionDays: null,
    notStartedPct: 100,
    inProgressPct: 0,
    completedPct: 0,
    manager: "Nadia Iskandar",
    picName: "Wahyu Setiawan",
    picEmail: "wahyu.setiawan@koperasisb.co.id",
    trainingBreakdown: [],
  },
];

const STAFF_ASSIGNMENTS = [
  { id: 1, name: "Pak Hendra Wijaya", roles: ["tutor", "examiner"], assignment: "Competency Assessor Certification (BNSP)", note: "Assigned as both Tutor and Examiner for this cohort" },
  { id: 2, name: "Bu Kartika Sari", roles: ["tutor"], assignment: "ISO 9001:2015 Quality Management", note: "Tutor only — exam reviewed by an external examiner" },
  { id: 3, name: "Pak Yusuf Ramadhan", roles: ["examiner"], assignment: "Competency Assessor Certification (BNSP) — Batch 2", note: "Examiner only, per BNSP independence requirement" },
  { id: 4, name: "Bu Rina Anggraini", roles: ["tutor"], assignment: "Internal Audit Fundamentals", note: "Tutor for internal compliance track" },
  { id: 5, name: "Pak Dimas Aditya", roles: ["tutor", "examiner"], assignment: "2026 H&S Regulation Update", note: "Internal training — same person tutors and signs off completion" },
];

// Certificates grouped by training program
const CERT_BY_TRAINING = [
  { training: "Competency Assessor Certification (BNSP)", issued: 41, active: 36, expiringSoon: 5, noExpiry: 0 },
  { training: "ISO 9001:2015 Quality Management", issued: 26, active: 23, expiringSoon: 3, noExpiry: 0 },
  { training: "2026 H&S Regulation Update", issued: 90, active: 90, expiringSoon: 0, noExpiry: 90 },
  { training: "Internal Audit Fundamentals", issued: 19, active: 17, expiringSoon: 2, noExpiry: 0 },
];

const CERT_COMPLIANCE = [
  { id: 1, cert: "Competency Assessor Certificate", holder: "Dinda Pramesti", issued: "Feb 2, 2026", refreshBy: "Feb 2, 2029", cpdStatus: "On Track" },
  { id: 2, cert: "H&S Regulation Awareness Certificate", holder: "Budi Santoso", issued: "May 12, 2026", refreshBy: "No expiry", cpdStatus: "Not Required" },
  { id: 3, cert: "Internal Audit Fundamentals Certificate", holder: "Sri Wulandari", issued: "Mar 18, 2026", refreshBy: "Mar 18, 2027", cpdStatus: "Behind" },
  { id: 4, cert: "Competency Assessor Certificate", holder: "Agus Prabowo", issued: "Jan 9, 2024", refreshBy: "Jan 9, 2027", cpdStatus: "Behind" },
];

const cpdNeedsUpdateCount = 34;
const totalActiveCerts = CERT_BY_TRAINING.reduce((a, c) => a + c.active, 0);
const totalExpiringSoon = CERT_BY_TRAINING.reduce((a, c) => a + c.expiringSoon, 0);
const totalNoExpiry = CERT_BY_TRAINING.reduce((a, c) => a + c.noExpiry, 0);

// Reports & Analytics data
const ENROLLMENT_TREND = [
  { month: "Jan", thisYear: 210, lastYear: 165 },
  { month: "Feb", thisYear: 245, lastYear: 180 },
  { month: "Mar", thisYear: 268, lastYear: 205 },
  { month: "Apr", thisYear: 250, lastYear: 210 },
  { month: "May", thisYear: 290, lastYear: 230 },
  { month: "Jun", thisYear: 305, lastYear: 240 },
  { month: "Jul", thisYear: 322, lastYear: 250 },
];

const RECOMMENDATION_COLOR = {
  "Keep & Invest": COLORS.sage,
  Keep: COLORS.cyan,
  Revise: COLORS.amber,
  Monitor: COLORS.violet,
  "Discontinue or Revise": COLORS.crimson,
};

// Full training portfolio — the basis for the Keep / Revise / Discontinue decision and pricing analysis
const TRAINING_PORTFOLIO = [
  {
    title: "Competency Assessor Certification (BNSP)",
    category: "Professional Certification",
    enrollment: 41,
    trend: 18,
    revenue: 184500000,
    completion: 71,
    passRate: 82,
    price: 4500000,
    marketAvg: 4200000,
    satisfaction: 4.6,
    seatUtil: 82,
    recommendation: "Revise",
    rationale: "Strong, growing demand and pricing power — but completion lags at 71%. Review Module 2 pacing and add more scaffolding before the exam.",
  },
  {
    title: "ISO 9001:2015 Quality Management",
    category: "Professional Certification",
    enrollment: 28,
    trend: 9,
    revenue: 89600000,
    completion: 79,
    passRate: 88,
    price: 3200000,
    marketAvg: 3500000,
    satisfaction: 4.5,
    seatUtil: 70,
    recommendation: "Keep & Invest",
    rationale: "Healthy completion and pass rate, priced below market — room to raise price without hurting demand.",
  },
  {
    title: "Effective Communication for Assessors",
    category: "General Development",
    enrollment: 12,
    trend: -5,
    revenue: 11400000,
    completion: 90,
    passRate: null,
    price: 950000,
    marketAvg: 1100000,
    satisfaction: 4.2,
    seatUtil: 25,
    recommendation: "Monitor",
    rationale: "High completion among those who enroll, but low and declining demand. Consider bundling into the Assessor Certification track instead of selling standalone.",
  },
  {
    title: "2026 H&S Regulation Update",
    category: "Internal · Compliance",
    enrollment: 96,
    trend: 3,
    revenue: 0,
    completion: 94,
    passRate: 100,
    price: 0,
    marketAvg: null,
    satisfaction: 4.7,
    seatUtil: 64,
    recommendation: "Keep",
    rationale: "Mandatory compliance training with excellent completion — performing as intended, not a revenue lever.",
  },
  {
    title: "Training Proposal Writing Techniques",
    category: "Skill Development",
    enrollment: 14,
    trend: -12,
    revenue: 0,
    completion: 55,
    passRate: null,
    price: 0,
    marketAvg: null,
    satisfaction: 3.6,
    seatUtil: 28,
    recommendation: "Discontinue or Revise",
    rationale: "Lowest completion rate in the catalog and declining enrollment. Rebuild the content or retire it in favor of a live workshop format.",
  },
  {
    title: "Internal Audit Fundamentals",
    category: "Professional Certification",
    enrollment: 19,
    trend: 6,
    revenue: 52250000,
    completion: 68,
    passRate: 90,
    price: 2750000,
    marketAvg: 2600000,
    satisfaction: 4.3,
    seatUtil: 63,
    recommendation: "Revise",
    rationale: "Those who finish pass at a high rate, but 32% drop off before completing — likely a pacing or workload issue in Module 2.",
  },
  {
    title: "Project Risk Management",
    category: "General Development",
    enrollment: 18,
    trend: 22,
    revenue: 33300000,
    completion: 81,
    passRate: null,
    price: 1850000,
    marketAvg: 2100000,
    satisfaction: 4.4,
    seatUtil: 72,
    recommendation: "Keep & Invest",
    rationale: "Fastest-growing training in the catalog, strong completion, and priced below market — a clear candidate for a marketing push.",
  },
  {
    title: "K3 Regulatory Compliance for Managers",
    category: "Internal · Compliance",
    enrollment: 25,
    trend: 1,
    revenue: 0,
    completion: 88,
    passRate: null,
    price: 0,
    marketAvg: null,
    satisfaction: 4.5,
    seatUtil: 50,
    recommendation: "Keep",
    rationale: "Stable mandatory training performing within expectations.",
  },
];

// Participant totals below intentionally sum to KPIS.individualCount (812) and KPIS.corporateCount (472)
const REGION_DATA = [
  { region: "DKI Jakarta", individual: 260, corporate: 180 },
  { region: "Jawa Barat", individual: 160, corporate: 110 },
  { region: "Jawa Timur", individual: 120, corporate: 70 },
  { region: "Sumatera Utara", individual: 64, corporate: 34 },
  { region: "Kalimantan Timur", individual: 44, corporate: 30 },
  { region: "Other Regions", individual: 164, corporate: 48 },
];

const POSITION_DATA = [
  { position: "Staff / Officer", individual: 260, corporate: 120 },
  { position: "Supervisor", individual: 180, corporate: 150 },
  { position: "Manager", individual: 150, corporate: 130 },
  { position: "Senior Manager / AVP", individual: 70, corporate: 50 },
  { position: "Director / C-Level", individual: 20, corporate: 22 },
  { position: "Freelance / Consultant", individual: 132, corporate: 0 },
];

const CLIENT_REVENUE = [
  { name: "Bank Nusantara Sejahtera", revenue: 145000000 },
  { name: "PT Sumber Makmur", revenue: 98000000 },
  { name: "PT Cipta Konstruksi", revenue: 52000000 },
  { name: "Graha Logistik Indonesia", revenue: 31000000 },
];
const clientRevenueTotal = CLIENT_REVENUE.reduce((a, c) => a + c.revenue, 0);
let cumulative = 0;
const CLIENT_PARETO = CLIENT_REVENUE.map((c) => {
  cumulative += c.revenue;
  return { ...c, cumulativePct: Math.round((cumulative / clientRevenueTotal) * 100) };
});
const top2ClientSharePct = CLIENT_PARETO[1]?.cumulativePct ?? 0;

const PERIOD_OPTIONS = ["Last 3 Months", "Year to Date"];

function formatIDR(v) {
  return "Rp " + Math.round(v).toLocaleString("id-ID");
}
function formatIDRShort(v) {
  return "Rp " + (v / 1000000).toFixed(0) + "jt";
}

function StatTile({ Icon, eyebrow, value, sub, accent }) {
  return (
    <div className="flex-1 rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: `${accent}14` }}>
          <Icon size={14} style={{ color: accent }} />
        </div>
        <div className="text-[10px] uppercase tracking-wider" style={{ color: COLORS.ink60 }}>
          {eyebrow}
        </div>
      </div>
      <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="mt-2 text-xl font-semibold">
        {value}
      </div>
      {sub && (
        <div className="mt-0.5 text-xs" style={{ color: COLORS.ink60 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, sub, right }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-xl font-semibold">
          {title}
        </h2>
        {sub && (
          <p className="mt-0.5 text-sm" style={{ color: COLORS.ink60 }}>
            {sub}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

function Pill({ children, color }) {
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color, backgroundColor: `${color}14` }}>
      {children}
    </span>
  );
}

function CpdPill({ status }) {
  const map = {
    Compliant: COLORS.sage,
    "On Track": COLORS.sage,
    "At Risk": COLORS.amber,
    Behind: COLORS.amber,
    "Non-Compliant": COLORS.crimson,
    "Not Required": COLORS.ink60,
  };
  return <Pill color={map[status] || COLORS.ink60}>{status}</Pill>;
}

function ChartCard({ title, sub, children, height = 260 }) {
  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
      <div className="mb-1 text-sm font-medium" style={{ color: COLORS.ink }}>
        {title}
      </div>
      {sub && (
        <div className="mb-3 text-xs" style={{ color: COLORS.ink60 }}>
          {sub}
        </div>
      )}
      <div style={{ width: "100%", height }}>{children}</div>
    </div>
  );
}

const axisStyle = { fontSize: 11, fill: COLORS.ink60, fontFamily: "Inter, sans-serif" };
const tooltipStyle = { backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, borderRadius: 8, fontSize: 12 };

// ---------------- Dashboard (formerly Overview) ----------------
function DashboardTab() {
  return (
    <div className="space-y-8">
      <div>
        <SectionHeader title="Active Participants" sub="Reach across the current period and historical trend" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile Icon={Users2} accent={COLORS.primary} eyebrow="This Month" value={KPIS.activeParticipantsThisMonth.toLocaleString("id-ID")} sub={`${KPIS.individualCount} individual · ${KPIS.corporateCount} corporate`} />
          <StatTile Icon={Users2} accent={COLORS.cyan} eyebrow="This Year (YTD)" value={PARTICIPANTS_YEARLY[3].count.toLocaleString("id-ID")} sub="Jan–Jul 2026" />
          <StatTile Icon={Users2} accent={COLORS.violet} eyebrow="Last Year (2025)" value={PARTICIPANTS_YEARLY[2].count.toLocaleString("id-ID")} sub="Full year total" />
          <StatTile Icon={Users2} accent={COLORS.ink60} eyebrow="Last 3 Years Total" value={PARTICIPANTS_YEARLY.slice(0, 3).reduce((a, y) => a + y.count, 0).toLocaleString("id-ID")} sub="2023–2025 combined" />
        </div>
        <div className="mt-3">
          <ChartCard title="Active Participants by Year" height={220}>
            <ResponsiveContainer>
              <BarChart data={PARTICIPANTS_YEARLY}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} vertical={false} />
                <XAxis dataKey="year" tick={axisStyle} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Active Participants" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      <div>
        <SectionHeader title="Revenue" sub="Split by segment, with forecast for upcoming periods" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile Icon={Wallet} accent={COLORS.primary} eyebrow="This Month" value={formatIDRShort(revenueThisMonth)} sub={`Corp ${formatIDRShort(REVENUE_MONTHLY[6].corporate)} · Indiv ${formatIDRShort(REVENUE_MONTHLY[6].individual)}`} />
          <StatTile Icon={TrendingUp} accent={COLORS.cyan} eyebrow="Forecast Next Month" value={formatIDRShort(revenueNextMonth)} sub="Aug 2026 projection" />
          <StatTile Icon={TrendingUp} accent={COLORS.violet} eyebrow="Forecast Next 3 Months" value={formatIDRShort(revenueNext3Months)} sub="Aug–Oct 2026" />
          <StatTile Icon={Wallet} accent={COLORS.sage} eyebrow="This Year (YTD)" value={formatIDRShort(revenueYtdActual)} sub={`Corp ${formatIDRShort(corporateYtd)} · Indiv ${formatIDRShort(individualYtd)}`} />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartCard title="Monthly Revenue — Corporate vs Individual" sub="Solid bars are actual; lighter bars (Aug–Oct) are forecast" height={280}>
              <ResponsiveContainer>
                <BarChart data={REVENUE_MONTHLY}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} vertical={false} />
                  <XAxis dataKey="month" tick={axisStyle} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000}jt`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatIDR(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="corporate" name="Corporate" stackId="a" radius={[0, 0, 0, 0]}>
                    {REVENUE_MONTHLY.map((m, i) => (
                      <Cell key={i} fill={COLORS.primary} fillOpacity={m.forecast ? 0.35 : 1} />
                    ))}
                  </Bar>
                  <Bar dataKey="individual" name="Individual" stackId="a" radius={[4, 4, 0, 0]}>
                    {REVENUE_MONTHLY.map((m, i) => (
                      <Cell key={i} fill={COLORS.cyan} fillOpacity={m.forecast ? 0.35 : 1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="rounded-lg p-5" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="text-sm font-medium" style={{ color: COLORS.ink }}>
              This Year Forecast
            </div>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="mt-2 text-2xl font-semibold">
              {formatIDRShort(revenueYearForecast)}
            </div>
            <div className="mt-1 text-xs" style={{ color: COLORS.ink60 }}>
              Full-year 2026 projection, based on YTD actuals plus trend-line growth for the remaining months.
            </div>
            <div className="mt-4 h-px" style={{ backgroundColor: COLORS.line }} />
            <div className="mt-4 flex items-center justify-between text-xs">
              <span style={{ color: COLORS.ink60 }}>YTD Actual</span>
              <span style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }}>{formatIDRShort(revenueYtdActual)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span style={{ color: COLORS.ink60 }}>Projected Remainder</span>
              <span style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }}>{formatIDRShort(revenueYearForecast - revenueYtdActual)}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader title="Revenue Streams" sub="Training sales are only part of the picture — membership and verifier subscriptions are real revenue too" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatTile Icon={BookOpen} accent={COLORS.primary} eyebrow="Training Sales" value={formatIDRShort(REVENUE_STREAMS_THIS_MONTH.trainingSales)} sub="Individual + corporate, this month" />
          <StatTile Icon={Crown} accent={COLORS.violet} eyebrow="Participant Memberships" value={formatIDRShort(REVENUE_STREAMS_THIS_MONTH.participantMemberships)} sub="Premium subscriptions, this month" />
          <StatTile Icon={ShieldCheck} accent={COLORS.cyan} eyebrow="Verifier Subscriptions" value={formatIDRShort(REVENUE_STREAMS_THIS_MONTH.verifierSubscriptions)} sub="Employer verification plans, this month" />
        </div>
        <div className="mt-3 rounded-lg p-4" style={{ backgroundColor: `${COLORS.primary}0A`, border: `1px solid ${COLORS.primary}30` }}>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: COLORS.ink }}>Total Revenue This Month (all streams)</span>
            <span style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="font-semibold">
              {formatIDRShort(totalRevenueThisMonth)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile Icon={BookOpen} accent={COLORS.cyan} eyebrow="Ongoing Trainings" value={KPIS.ongoingTrainings} sub="Across all categories" />
        <StatTile Icon={Award} accent={COLORS.sage} eyebrow="Certificates This Month" value={KPIS.certificatesThisMonth} sub="Issued LMS-wide" />
        <StatTile Icon={Clock} accent={COLORS.amber} eyebrow="Pending Reviews" value={KPIS.pendingReviews} sub="Tutor & examiner queues combined" />
        <StatTile Icon={ShieldCheck} accent={COLORS.crimson} eyebrow="CPD Compliance Rate" value={`${KPIS.cpdCompliance}%`} sub="Across all certified participants" />
      </div>

      <div>
        <SectionHeader title="Platform Health" sub="Corporate adoption and satisfaction across both participant segments" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            Icon={Building2}
            accent={COLORS.primary}
            eyebrow="Active Corporate Accounts"
            value={KPIS.activeCorporateAccounts}
            sub={`${CORPORATE_ACCOUNTS.filter((c) => c.status === "pending_activation").length} pending activation`}
          />
          <StatTile Icon={Smile} accent={COLORS.amber} eyebrow="Corporate Satisfaction" value={`${KPIS.avgSatisfaction}/5`} sub="Average across active corporate accounts" />
          <StatTile Icon={Smile} accent={COLORS.violet} eyebrow="Individual Satisfaction" value="4.5/5" sub="Quarterly participant survey" />
          <StatTile Icon={ShieldCheck} accent={COLORS.cyan} eyebrow="Verifier Accounts" value={25} sub="Companies with search/verification access" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile Icon={Crown} accent={COLORS.cyan} eyebrow="Premium Members" value={380} sub="Participants on paid membership" />
        </div>
      </div>

      <div>
        <SectionHeader title="Alerts" sub="Items that may need operator attention" />
        <div className="space-y-2">
          {ALERTS.map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-lg px-4 py-3" style={{ backgroundColor: `${COLORS[a.tone]}12`, border: `1px solid ${COLORS[a.tone]}40` }}>
              <AlertTriangle size={16} style={{ color: COLORS[a.tone] }} className="mt-0.5 shrink-0" />
              <span className="text-sm" style={{ color: COLORS.ink }}>
                {a.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader title="Recent Activity" sub="Latest system events" />
        <div className="space-y-2">
          {[
            { icon: Award, text: "Certificate issued to Maya Kusuma — Competency Assessor Certification", time: "12 min ago", color: COLORS.sage },
            { icon: PenSquare, text: "Hendra Wijaya graded 3 exercise submissions", time: "1 hr ago", color: COLORS.cyan },
            { icon: TrendingUp, text: "PT Cipta Konstruksi purchased 10 seats for Internal Audit Fundamentals", time: "3 hrs ago", color: COLORS.violet },
            { icon: ShieldCheck, text: "Yusuf Ramadhan finalized an exam decision: Competent", time: "5 hrs ago", color: COLORS.primary },
          ].map((e, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg p-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${e.color}14` }}>
                <e.icon size={14} style={{ color: e.color }} />
              </div>
              <span className="flex-1 text-sm" style={{ color: COLORS.ink }}>
                {e.text}
              </span>
              <span className="whitespace-nowrap text-xs" style={{ color: COLORS.ink60 }}>
                {e.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- Reports & Analytics ----------------
function FilterBar({ category, setCategory, segment, setSegment, period, setPeriod }) {
  const selectStyle = { backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink };
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg p-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
      <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: COLORS.ink }}>
        <Filter size={13} style={{ color: COLORS.primary }} /> Filters:
      </span>
      <select value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-md px-2.5 py-1.5 text-xs outline-none" style={selectStyle}>
        {PERIOD_OPTIONS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md px-2.5 py-1.5 text-xs outline-none" style={selectStyle}>
        <option value="All">All Categories</option>
        {CATEGORY_OPTIONS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select value={segment} onChange={(e) => setSegment(e.target.value)} className="rounded-md px-2.5 py-1.5 text-xs outline-none" style={selectStyle}>
        <option value="All">All Segments</option>
        <option value="Individual">Individual</option>
        <option value="Corporate">Corporate</option>
      </select>
      {(category !== "All" || segment !== "All" || period !== PERIOD_OPTIONS[1]) && (
        <button
          onClick={() => {
            setCategory("All");
            setSegment("All");
            setPeriod(PERIOD_OPTIONS[1]);
          }}
          className="text-xs font-medium"
          style={{ color: COLORS.primary }}
        >
          Reset
        </button>
      )}
    </div>
  );
}

function RecommendationPill({ rec }) {
  return <Pill color={RECOMMENDATION_COLOR[rec] || COLORS.ink60}>{rec}</Pill>;
}

const REPORT_SECTIONS = [
  { key: "revenue", label: "Revenue & Forecast" },
  { key: "enrollment", label: "Enrollment Trends" },
  { key: "portfolio", label: "Training Portfolio (Keep/Revise/Discontinue)" },
  { key: "pricing", label: "Competitive Pricing" },
  { key: "demographics", label: "Geographic & Position Demographics" },
  { key: "concentration", label: "Corporate Client Concentration" },
];

function GenerateReportModal({ onClose }) {
  const [sections, setSections] = useState(() => Object.fromEntries(REPORT_SECTIONS.map((s) => [s.key, true])));
  const [range, setRange] = useState("This Month");
  const [format, setFormat] = useState("pdf");
  const [status, setStatus] = useState("idle"); // idle | generating | ready

  const toggleSection = (key) => setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  const selectedCount = Object.values(sections).filter(Boolean).length;

  const handleGenerate = () => {
    setStatus("generating");
    setTimeout(() => setStatus("ready"), 1200);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-5" style={{ backgroundColor: "rgba(16,27,51,0.5)" }}>
      <div className="w-full max-w-md rounded-xl p-6" style={{ backgroundColor: COLORS.card }}>
        <div className="flex items-center justify-between">
          <h3 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-lg font-semibold">
            Generate Report
          </h3>
          <button onClick={onClose}>
            <X size={18} style={{ color: COLORS.ink60 }} />
          </button>
        </div>
        <p className="mt-1 text-xs" style={{ color: COLORS.ink60 }}>
          Pick the sections and range you need — for a management update, PDF is usually cleanest; for further
          analysis, export raw data as Excel.
        </p>

        <div className="mt-4">
          <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
            Sections to include ({selectedCount}/{REPORT_SECTIONS.length})
          </div>
          <div className="mt-2 space-y-1.5">
            {REPORT_SECTIONS.map((s) => (
              <label key={s.key} className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs" style={{ backgroundColor: COLORS.paper, color: COLORS.ink }}>
                <input type="checkbox" checked={sections[s.key]} onChange={() => toggleSection(s.key)} />
                {s.label}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
              Date Range
            </label>
            <select value={range} onChange={(e) => setRange(e.target.value)} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
              {["This Month", "This Quarter", "This Year", "Last 12 Months"].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
              Format
            </label>
            <div className="mt-1 flex gap-2">
              <button
                onClick={() => setFormat("pdf")}
                className="flex-1 rounded-md py-2.5 text-xs font-medium"
                style={{ backgroundColor: format === "pdf" ? COLORS.primary : COLORS.paper, color: format === "pdf" ? "#fff" : COLORS.ink, border: `1px solid ${format === "pdf" ? COLORS.primary : COLORS.line}` }}
              >
                PDF
              </button>
              <button
                onClick={() => setFormat("excel")}
                className="flex-1 rounded-md py-2.5 text-xs font-medium"
                style={{ backgroundColor: format === "excel" ? COLORS.primary : COLORS.paper, color: format === "excel" ? "#fff" : COLORS.ink, border: `1px solid ${format === "excel" ? COLORS.primary : COLORS.line}` }}
              >
                Excel
              </button>
            </div>
          </div>
        </div>

        {status === "ready" ? (
          <div className="mt-5 flex items-center justify-between rounded-lg p-3" style={{ backgroundColor: `${COLORS.sage}12`, border: `1px solid ${COLORS.sage}35` }}>
            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: COLORS.ink }}>
              <Check size={13} style={{ color: COLORS.sage }} /> Report ready
            </span>
            <button className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: COLORS.sage }}>
              <Download size={12} /> Download {format.toUpperCase()}
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={selectedCount === 0 || status === "generating"}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: COLORS.primary }}
          >
            {status === "generating" ? "Generating…" : "Generate Report"}
          </button>
        )}
      </div>
    </div>
  );
}

function ReportsTab() {
  const [category, setCategory] = useState("All");
  const [segment, setSegment] = useState("All");
  const [period, setPeriod] = useState(PERIOD_OPTIONS[1]);
  const [showReportModal, setShowReportModal] = useState(false);

  const trendData = period === "Last 3 Months" ? ENROLLMENT_TREND.slice(-3) : ENROLLMENT_TREND;
  const growthRate = Math.round(((ENROLLMENT_TREND[6].thisYear - ENROLLMENT_TREND[6].lastYear) / ENROLLMENT_TREND[6].lastYear) * 100);

  const portfolioFiltered = useMemo(() => (category === "All" ? TRAINING_PORTFOLIO : TRAINING_PORTFOLIO.filter((t) => t.category === category)), [category]);
  const avgCompletion = Math.round(portfolioFiltered.reduce((a, t) => a + t.completion, 0) / (portfolioFiltered.length || 1));
  const passRates = portfolioFiltered.filter((t) => t.passRate != null);
  const avgPassRate = Math.round(passRates.reduce((a, t) => a + t.passRate, 0) / (passRates.length || 1));

  const pricingRows = portfolioFiltered.filter((t) => t.marketAvg != null);

  const categorySummary = useMemo(() => {
    const map = {};
    TRAINING_PORTFOLIO.forEach((t) => {
      if (!map[t.category]) map[t.category] = { category: t.category, enrollment: 0, revenue: 0 };
      map[t.category].enrollment += t.enrollment;
      map[t.category].revenue += t.revenue;
    });
    return Object.values(map);
  }, []);

  const regionRows = REGION_DATA.map((r) => ({
    region: r.region,
    value: segment === "Individual" ? r.individual : segment === "Corporate" ? r.corporate : r.individual + r.corporate,
  }));
  const positionRows = POSITION_DATA.map((p) => ({
    position: p.position,
    value: segment === "Individual" ? p.individual : segment === "Corporate" ? p.corporate : p.individual + p.corporate,
  }));

  return (
    <div className="space-y-8">
      <div className="rounded-lg p-4 text-xs" style={{ backgroundColor: `${COLORS.primary}0A`, border: `1px solid ${COLORS.primary}30`, color: COLORS.ink }}>
        <div className="flex items-center gap-1.5 font-medium">
          <Info size={13} style={{ color: COLORS.primary }} /> What this report covers
        </div>
        <p className="mt-1" style={{ color: COLORS.ink60 }}>
          Demand and quality trends, a Keep/Revise/Discontinue view of the training portfolio, pricing vs. the
          market, where participants come from and what roles they hold, and how concentrated corporate revenue is
          in a handful of clients. Use the filters below to narrow any of it down.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <FilterBar category={category} setCategory={setCategory} segment={segment} setSegment={setSegment} period={period} setPeriod={setPeriod} />
        <button onClick={() => setShowReportModal(true)} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
          <Download size={13} /> Generate Report
        </button>
      </div>
      {showReportModal && <GenerateReportModal onClose={() => setShowReportModal(false)} />}

      <div>
        <SectionHeader title={`This Month & Year — ${new Date(2026, 6, 16).toLocaleString("en-US", { month: "long" })} 2026`} sub="Core performance indicators, reflecting the filters above" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile Icon={Users2} accent={COLORS.primary} eyebrow="Enrollments This Month" value={ENROLLMENT_TREND[6].thisYear} sub={`vs ${ENROLLMENT_TREND[6].lastYear} same month last year`} />
          <StatTile Icon={TrendingUp} accent={COLORS.sage} eyebrow="YoY Enrollment Growth" value={`+${growthRate}%`} sub="July 2026 vs July 2025" />
          <StatTile Icon={CheckCircle2} accent={COLORS.cyan} eyebrow="Avg Completion Rate" value={`${avgCompletion}%`} sub={category === "All" ? "Across all trainings" : category} />
          <StatTile Icon={ShieldCheck} accent={COLORS.violet} eyebrow="Avg Exam Pass Rate" value={`${avgPassRate}%`} sub="First-attempt pass rate" />
        </div>
      </div>

      <ChartCard title="Enrollment Trend — This Year vs Last Year" sub={`Monthly new enrollments · ${period}`} height={280}>
        <ResponsiveContainer>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} vertical={false} />
            <XAxis dataKey="month" tick={axisStyle} axisLine={{ stroke: COLORS.line }} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="thisYear" name="2026" stroke={COLORS.primary} strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="lastYear" name="2025" stroke={COLORS.ink60} strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Revenue by Category" sub="Where the training revenue actually comes from" height={240}>
        <ResponsiveContainer>
          <BarChart data={categorySummary} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} horizontal={false} />
            <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000}jt`} />
            <YAxis type="category" dataKey="category" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} width={140} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatIDR(v)} />
            <Bar dataKey="revenue" name="Revenue" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div>
        <SectionHeader
          title="Training Portfolio — Keep, Revise, or Discontinue"
          sub="Enrollment growth vs. completion rate. Bubble size = revenue. Use this to decide what to double down on."
        />
        <ChartCard title="Portfolio Map" height={320}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} />
              <XAxis type="number" dataKey="trend" name="Enrollment Growth" unit="%" tick={axisStyle} axisLine={{ stroke: COLORS.line }} tickLine={false} />
              <YAxis type="number" dataKey="completion" name="Completion Rate" unit="%" tick={axisStyle} axisLine={false} tickLine={false} domain={[40, 100]} />
              <ZAxis type="number" dataKey="revenue" range={[80, 500]} name="Revenue" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={tooltipStyle} formatter={(v, n) => (n === "Revenue" ? formatIDR(v) : `${v}%`)} labelFormatter={() => ""} />
              <Scatter data={portfolioFiltered} fill={COLORS.primary}>
                {portfolioFiltered.map((t, i) => (
                  <Cell key={i} fill={RECOMMENDATION_COLOR[t.recommendation]} fillOpacity={0.75} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className="mt-2 flex flex-wrap gap-3 text-[11px]" style={{ color: COLORS.ink60 }}>
          {Object.entries(RECOMMENDATION_COLOR).map(([label, color]) => (
            <span key={label} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} /> {label}
            </span>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {portfolioFiltered.map((t, i) => (
            <div key={i} className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium" style={{ color: COLORS.ink }}>
                  {t.title}
                </span>
                <RecommendationPill rec={t.recommendation} />
              </div>
              <div className="mt-1.5 flex flex-wrap gap-3 text-[11px]" style={{ color: COLORS.ink60 }}>
                <span className="flex items-center gap-1">
                  {t.trend >= 0 ? <TrendingUp size={11} style={{ color: COLORS.sage }} /> : <TrendingDown size={11} style={{ color: COLORS.crimson }} />}
                  {t.trend >= 0 ? "+" : ""}
                  {t.trend}% enrollment
                </span>
                <span>Completion {t.completion}%</span>
                {t.passRate != null && <span>Pass rate {t.passRate}%</span>}
                <span>Seat utilization {t.seatUtil}%</span>
                <span>{formatIDRShort(t.revenue)} revenue</span>
              </div>
              <p className="mt-2 text-xs" style={{ color: COLORS.ink }}>
                {t.rationale}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader title="Competitive Pricing" sub="Our price vs. an estimated market average for comparable programs" />
        <div className="overflow-hidden rounded-lg" style={{ border: `1px solid ${COLORS.line}` }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ backgroundColor: COLORS.paper }}>
                {["Training", "Our Price", "Market Avg", "Difference", "Position", "Suggested Action"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pricingRows.map((t, i) => {
                const diffPct = Math.round(((t.price - t.marketAvg) / t.marketAvg) * 100);
                const position = diffPct > 5 ? "Above Market" : diffPct < -5 ? "Below Market" : "At Market";
                const posColor = position === "Above Market" ? COLORS.amber : position === "Below Market" ? COLORS.sage : COLORS.ink60;
                const action =
                  position === "Below Market" ? `Room to raise ~${Math.abs(diffPct)}%` : position === "Above Market" ? "Monitor conversion rate" : "Pricing is well-calibrated";
                return (
                  <tr key={i} style={{ borderTop: `1px solid ${COLORS.line}`, backgroundColor: COLORS.card }}>
                    <td className="px-4 py-2.5 text-sm font-medium" style={{ color: COLORS.ink }}>
                      {t.title}
                    </td>
                    <td className="px-4 py-2.5 text-xs" style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }}>
                      {formatIDRShort(t.price)}
                    </td>
                    <td className="px-4 py-2.5 text-xs" style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink60 }}>
                      {formatIDRShort(t.marketAvg)}
                    </td>
                    <td className="px-4 py-2.5 text-xs" style={{ fontFamily: "IBM Plex Mono, monospace", color: diffPct >= 0 ? COLORS.amber : COLORS.sage }}>
                      {diffPct >= 0 ? "+" : ""}
                      {diffPct}%
                    </td>
                    <td className="px-4 py-2.5">
                      <Pill color={posColor}>{position}</Pill>
                    </td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: COLORS.ink60 }}>
                      {action}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pricingRows.length === 0 && (
            <div className="p-6 text-center text-sm" style={{ color: COLORS.ink60 }}>
              No priced trainings in this category — internal/compliance trainings aren't sold, so there's no market price to compare.
            </div>
          )}
        </div>
      </div>

      <div>
        <SectionHeader title="Where Participants Come From" sub={`Geographic distribution${segment !== "All" ? ` — ${segment} only` : ""}`} />
        <ChartCard title="Participants by Region" height={260}>
          <ResponsiveContainer>
            <BarChart data={regionRows}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} vertical={false} />
              <XAxis dataKey="region" tick={{ ...axisStyle, fontSize: 10 }} axisLine={{ stroke: COLORS.line }} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" name="Participants" fill={COLORS.cyan} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div>
        <SectionHeader title="Who Is Taking Our Trainings" sub={`Distribution by role / seniority${segment !== "All" ? ` — ${segment} only` : ""}`} />
        <ChartCard title="Participants by Position" sub="Useful for pricing tiers, marketing angle, and content depth decisions" height={260}>
          <ResponsiveContainer>
            <BarChart data={positionRows} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} horizontal={false} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="position" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} width={150} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" name="Participants" fill={COLORS.violet} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div>
        <SectionHeader title="Corporate Client Concentration" sub="How dependent corporate revenue is on a small number of clients" />
        <ChartCard title="Revenue Share by Client (Pareto)" height={260}>
          <ResponsiveContainer>
            <ComposedChart data={CLIENT_PARETO}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} vertical={false} />
              <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 10 }} axisLine={{ stroke: COLORS.line }} tickLine={false} interval={0} angle={-12} textAnchor="end" height={55} />
              <YAxis yAxisId="left" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000}jt`} />
              <YAxis yAxisId="right" orientation="right" tick={axisStyle} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => (n === "Revenue" ? formatIDR(v) : `${v}%`)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="cumulativePct" name="Cumulative %" stroke={COLORS.crimson} strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
        {top2ClientSharePct >= 60 && (
          <div className="mt-3 flex items-start gap-2 rounded-lg p-3 text-xs" style={{ backgroundColor: `${COLORS.crimson}12`, border: `1px solid ${COLORS.crimson}40`, color: COLORS.ink }}>
            <AlertOctagon size={14} style={{ color: COLORS.crimson }} className="mt-0.5 shrink-0" />
            Concentration risk: your top 2 corporate clients account for <strong>{top2ClientSharePct}%</strong> of corporate revenue. Losing either would materially hurt corporate revenue — worth diversifying the client base.
          </div>
        )}
      </div>

      <div className="rounded-xl p-6" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: COLORS.ink }}>
          <BarChart3 size={15} style={{ color: COLORS.primary }} /> Forecast — Next Year (2027)
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg p-3" style={{ backgroundColor: COLORS.paper }}>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-lg font-semibold">
              +{growthRate}%
            </div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
              Projected Enrollment Growth
            </div>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: COLORS.paper }}>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-lg font-semibold">
              {formatIDRShort(revenueYearForecast * 1.22)}
            </div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
              Projected Revenue
            </div>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: COLORS.paper }}>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-lg font-semibold">
              82%
            </div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
              Target CPD Compliance
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs" style={{ color: COLORS.ink60 }}>
          Assumes current YoY enrollment growth holds, corporate accounts renew at their present seat volume, and no
          major new certification track launches. Treat as a directional planning estimate, not a committed target —
          revisit quarterly as actuals come in.
        </p>
      </div>
    </div>
  );
}

// ---------------- Participants ----------------
function ParticipantsTab() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(
    () => PARTICIPANTS.filter((p) => (filter === "All" || p.type === filter) && p.name.toLowerCase().includes(query.toLowerCase())),
    [query, filter]
  );

  return (
    <div>
      <SectionHeader
        title="Participants"
        sub="Everyone enrolled in DeAcademy, individual or via a corporate account"
        right={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <Search size={13} style={{ color: COLORS.ink60 }} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name…" className="bg-transparent text-xs outline-none" style={{ color: COLORS.ink }} />
            </div>
            {["All", "Individual", "Corporate"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="rounded-md px-2.5 py-1.5 text-xs font-medium"
                style={{ backgroundColor: filter === f ? COLORS.primary : COLORS.card, color: filter === f ? "#fff" : COLORS.ink, border: `1px solid ${filter === f ? COLORS.primary : COLORS.line}` }}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />
      <div className="overflow-hidden rounded-lg" style={{ border: `1px solid ${COLORS.line}` }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ backgroundColor: COLORS.paper }}>
              {["Participant", "Type / Organization", "Trainings", "Certificates", "CPD Status", "Last Active", ""].map((h) => (
                <th key={h} className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} style={{ borderTop: `1px solid ${COLORS.line}`, backgroundColor: COLORS.card }}>
                <td className="px-4 py-2.5 text-sm font-medium" style={{ color: COLORS.ink }}>
                  {p.name}
                </td>
                <td className="px-4 py-2.5 text-xs" style={{ color: COLORS.ink60 }}>
                  {p.type === "Corporate" ? `Corporate · ${p.org}` : "Individual"}
                </td>
                <td className="px-4 py-2.5 text-xs" style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }}>
                  {p.trainings}
                </td>
                <td className="px-4 py-2.5 text-xs" style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }}>
                  {p.certs}
                </td>
                <td className="px-4 py-2.5">
                  <CpdPill status={p.cpd} />
                </td>
                <td className="px-4 py-2.5 text-xs" style={{ color: COLORS.ink60 }}>
                  {p.lastActive}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button style={{ color: COLORS.ink60 }}>
                    <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm" style={{ color: COLORS.ink60 }}>
            No participants match your search.
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- Lesson Content Setup (video vs. narrated slides) ----------------
function ContentTypeToggle({ value, onChange }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange("video")}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium"
        style={{
          backgroundColor: value === "video" ? COLORS.primary : COLORS.card,
          color: value === "video" ? "#fff" : COLORS.ink,
          border: `1px solid ${value === "video" ? COLORS.primary : COLORS.line}`,
        }}
      >
        <Video size={13} /> Video
      </button>
      <button
        onClick={() => onChange("slides")}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium"
        style={{
          backgroundColor: value === "slides" ? COLORS.primary : COLORS.card,
          color: value === "slides" ? "#fff" : COLORS.ink,
          border: `1px solid ${value === "slides" ? COLORS.primary : COLORS.line}`,
        }}
      >
        <Presentation size={13} /> Slides + Audio
      </button>
    </div>
  );
}

function MockFilePicker({ label, filename, onSelect, accept }) {
  return filename ? (
    <div className="flex items-center justify-between rounded-md px-2.5 py-2" style={{ backgroundColor: `${COLORS.sage}12`, border: `1px solid ${COLORS.sage}35` }}>
      <span className="truncate text-xs" style={{ color: COLORS.ink }}>
        {filename}
      </span>
      <button onClick={() => onSelect(null)}>
        <X size={12} style={{ color: COLORS.ink60 }} />
      </button>
    </div>
  ) : (
    <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium" style={{ border: `1px dashed ${COLORS.line}`, color: COLORS.ink60 }}>
      <Upload size={12} /> {label}
      <input type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && onSelect(e.target.files[0].name)} />
    </label>
  );
}

function ModuleContentEditor({ module, config, onChange }) {
  const set = (patch) => onChange({ ...config, ...patch });
  const topics = module.topics?.length ? module.topics : ["Slide 1"];

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
      <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.primary }}>
        {module.module}
      </div>
      <div className="mt-0.5 text-sm font-medium" style={{ color: COLORS.ink }}>
        {module.title}
      </div>

      <div className="mt-3">
        <ContentTypeToggle value={config.contentType} onChange={(contentType) => set({ contentType })} />
      </div>

      {config.contentType === "video" ? (
        <div className="mt-3">
          <MockFilePicker label="Upload video file (.mp4)" accept="video/*" filename={config.videoFile} onSelect={(name) => set({ videoFile: name })} />
        </div>
      ) : (
        <div className="mt-3">
          <MockFilePicker label="Upload slide deck (.pptx)" accept=".ppt,.pptx" filename={config.deckFile} onSelect={(name) => set({ deckFile: name })} />

          {config.deckFile && (
            <>
              <div className="mt-3 text-[11px]" style={{ color: COLORS.ink60 }}>
                {topics.length} slides detected from this module's syllabus topics. Upload one narration audio file per slide.
              </div>
              <div className="mt-2 space-y-2">
                {topics.map((topic, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md p-2" style={{ backgroundColor: COLORS.paper }}>
                    <span className="w-6 shrink-0 text-center text-[10px]" style={{ color: COLORS.ink60 }}>
                      {i + 1}
                    </span>
                    <span className="flex-1 truncate text-xs" style={{ color: COLORS.ink }}>
                      {topic}
                    </span>
                    <div className="w-44 shrink-0">
                      <MockFilePicker
                        label="Audio"
                        accept="audio/*"
                        filename={config.slideAudio?.[i]}
                        onSelect={(name) => set({ slideAudio: { ...config.slideAudio, [i]: name } })}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 overflow-hidden rounded-lg" style={{ border: `1px solid ${COLORS.line}` }}>
                <div className="h-1 w-full" style={{ backgroundColor: COLORS.primary }} />
                <div className="p-4" style={{ backgroundColor: COLORS.card }}>
                  <div className="text-[9px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                    Preview — how slide 1 will look in Course Player
                  </div>
                  <div style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="mt-1 text-sm font-semibold">
                    {topics[0]}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px]" style={{ color: COLORS.ink60 }}>
                    <Mic size={10} /> {config.slideAudio?.[0] ? "Narration attached" : "No narration uploaded yet"}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function LessonContentPanel({ training, onClose }) {
  const modules = training.syllabus || [];
  const [configs, setConfigs] = useState(() => modules.map(() => ({ contentType: "video", videoFile: null, deckFile: null, slideAudio: {} })));
  const [saved, setSaved] = useState(false);

  return (
    <div className="fixed inset-0 z-40 flex justify-end" style={{ backgroundColor: "rgba(16,27,51,0.45)" }}>
      <div className="h-full w-full max-w-lg overflow-y-auto p-6" style={{ backgroundColor: COLORS.paper }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs" style={{ color: COLORS.ink60 }}>
              Lesson Content Setup
            </div>
            <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="mt-0.5 text-xl font-semibold">
              {training.title}
            </h2>
          </div>
          <button onClick={onClose}>
            <X size={18} style={{ color: COLORS.ink60 }} />
          </button>
        </div>
        <p className="mt-2 text-xs" style={{ color: COLORS.ink60 }}>
          Choose how each module's core lesson is delivered. <strong>Video</strong> plays a single uploaded file.{" "}
          <strong>Slides + Audio</strong> turns this module's syllabus topics into slides participants page through
          one at a time, each with its own narration clip — this is what renders in Course Player.
        </p>

        {modules.length === 0 ? (
          <div className="mt-6 rounded-lg p-6 text-center text-sm" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink60 }}>
            This training doesn't have a syllabus yet. Add modules and topics first via <strong>Edit → Syllabus</strong>, then come back here to set the content type for each one.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {modules.map((m, i) => (
              <ModuleContentEditor key={i} module={m} config={configs[i]} onChange={(patch) => setConfigs((prev) => prev.map((c, ix) => (ix === i ? patch : c)))} />
            ))}
          </div>
        )}

        {saved && (
          <div className="mt-4 flex items-center gap-2 rounded-lg p-3 text-xs" style={{ backgroundColor: `${COLORS.sage}12`, border: `1px solid ${COLORS.sage}35`, color: COLORS.ink }}>
            <Check size={14} style={{ color: COLORS.sage }} /> Content configuration saved. This will sync to Course Player once the training is published.
          </div>
        )}

        {modules.length > 0 && (
          <button onClick={() => setSaved(true)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
            Save Content Configuration
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------- Trainings ----------------
function ListEditor({ label, items, onChange, placeholder }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    if (!draft.trim()) return;
    onChange([...items, draft.trim()]);
    setDraft("");
  };
  return (
    <div>
      <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
        {label}
      </label>
      <div className="mt-1 space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between rounded-md px-2.5 py-1.5" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}` }}>
            <span className="text-xs" style={{ color: COLORS.ink }}>
              {item}
            </span>
            <button onClick={() => onChange(items.filter((_, ix) => ix !== i))}>
              <X size={12} style={{ color: COLORS.ink60 }} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="w-full rounded-md p-2 text-xs outline-none"
          style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
        />
        <button onClick={add} className="shrink-0 rounded-md px-3 text-xs font-medium" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
          Add
        </button>
      </div>
    </div>
  );
}

function SyllabusEditor({ modules, onChange }) {
  const updateModule = (i, patch) => onChange(modules.map((m, ix) => (ix === i ? { ...m, ...patch } : m)));
  const removeModule = (i) => onChange(modules.filter((_, ix) => ix !== i));
  const addModule = () => onChange([...modules, { module: `Module ${modules.length + 1}`, title: "", topics: [] }]);

  return (
    <div>
      <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
        Syllabus
      </label>
      <div className="mt-1.5 space-y-3">
        {modules.map((m, i) => (
          <div key={i} className="rounded-lg p-3" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}` }}>
            <div className="flex items-center gap-2">
              <input
                value={m.module}
                onChange={(e) => updateModule(i, { module: e.target.value })}
                className="w-24 rounded-md p-1.5 text-[11px] outline-none"
                style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.primary }}
              />
              <input
                value={m.title}
                onChange={(e) => updateModule(i, { title: e.target.value })}
                placeholder="Module title"
                className="flex-1 rounded-md p-1.5 text-xs outline-none"
                style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
              />
              <button onClick={() => removeModule(i)}>
                <X size={13} style={{ color: COLORS.ink60 }} />
              </button>
            </div>
            <input
              value={m.topics.join(", ")}
              onChange={(e) => updateModule(i, { topics: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
              placeholder="Topics, comma-separated"
              className="mt-2 w-full rounded-md p-1.5 text-xs outline-none"
              style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
            />
          </div>
        ))}
      </div>
      <button onClick={addModule} className="mt-2 rounded-md px-3 py-1.5 text-xs font-medium" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
        + Add Module
      </button>
    </div>
  );
}

function RelatedTrainingsPicker({ value, onChange, allTrainings, currentCategory, excludeTitle }) {
  const [query, setQuery] = useState("");

  const candidates = allTrainings.filter((t) => t.title !== excludeTitle && !value.includes(t.title));
  const searchResults = query.trim() ? candidates.filter((t) => t.title.toLowerCase().includes(query.toLowerCase())).slice(0, 6) : [];
  const suggested = candidates.filter((t) => t.category === currentCategory).slice(0, 4);

  const add = (title) => {
    onChange([...value, title]);
    setQuery("");
  };
  const remove = (title) => onChange(value.filter((t) => t !== title));

  return (
    <div>
      <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
        Related / Relevant Trainings
      </label>
      <p className="mt-0.5 text-[11px]" style={{ color: COLORS.ink60 }}>
        Shown as "Recommended for You" to participants who complete this training, or haven't enrolled yet.
      </p>

      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((t) => (
            <span key={t} className="flex items-center gap-1.5 rounded-full py-1 pl-3 pr-1.5 text-xs font-medium" style={{ backgroundColor: `${COLORS.primary}14`, color: COLORS.primary }}>
              {t}
              <button onClick={() => remove(t)} className="flex h-4 w-4 items-center justify-center rounded-full" style={{ backgroundColor: `${COLORS.primary}22` }}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative mt-2">
        <div className="flex items-center gap-1.5 rounded-md px-2.5 py-2" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <Search size={13} style={{ color: COLORS.ink60 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search all ${allTrainings.length} trainings to link…`}
            className="w-full bg-transparent text-sm outline-none"
            style={{ color: COLORS.ink }}
          />
        </div>
        {searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, boxShadow: "0 4px 12px rgba(16,27,51,0.12)" }}>
            {searchResults.map((t) => (
              <button key={t.id} onClick={() => add(t.title)} className="flex w-full items-center justify-between px-3 py-2 text-left text-xs" style={{ borderTop: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
                <span>{t.title}</span>
                <span style={{ color: COLORS.ink60 }}>{t.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {suggested.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center gap-1 text-[11px]" style={{ color: COLORS.ink60 }}>
            <Sparkles size={11} style={{ color: COLORS.violet }} /> Suggested — same category ({currentCategory})
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {suggested.map((t) => (
              <button
                key={t.id}
                onClick={() => add(t.title)}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{ border: `1px dashed ${COLORS.violet}`, color: COLORS.violet }}
              >
                <Plus size={10} /> {t.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const BLANK_TRAINING = {
  title: "",
  category: CATEGORY_OPTIONS[0],
  level: LEVEL_OPTIONS[0],
  format: "Online",
  duration: "",
  price: 0,
  cpdHours: 0,
  seats: 20,
  nextBatch: "",
  status: "draft",
  description: "",
  objectives: [],
  syllabus: [],
  prerequisites: "",
  audience: "",
  relatedTrainings: [],
};

function TrainingFormPanel({ initial, allTrainings, onClose, onSave }) {
  const [form, setForm] = useState(initial ?? BLANK_TRAINING);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const canSubmit = form.title.trim().length > 0;

  return (
    <div className="fixed inset-0 z-40 flex justify-end" style={{ backgroundColor: "rgba(16,27,51,0.45)" }}>
      <div className="h-full w-full max-w-lg overflow-y-auto p-6" style={{ backgroundColor: COLORS.paper }}>
        <div className="flex items-center justify-between">
          <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-xl font-semibold">
            {initial ? "Edit Training" : "New Training"}
          </h2>
          <button onClick={onClose}>
            <X size={18} style={{ color: COLORS.ink60 }} />
          </button>
        </div>
        <p className="mt-1 text-xs" style={{ color: COLORS.ink60 }}>
          This content — description, objectives, and syllabus — is exactly what participants see in the catalog and
          course player, so fill it in the way you want it to read to them.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
              Title
            </label>
            <input value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Training title" className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
                Category
              </label>
              <select value={form.category} onChange={(e) => set({ category: e.target.value })} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
                Level
              </label>
              <select value={form.level} onChange={(e) => set({ level: e.target.value })} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
                {LEVEL_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
                Format
              </label>
              <input value={form.format} onChange={(e) => set({ format: e.target.value })} placeholder="e.g. Online + Exam" className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
                Duration
              </label>
              <input value={form.duration} onChange={(e) => set({ duration: e.target.value })} placeholder="e.g. 24 hrs · self-paced" className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
                Price (Rp)
              </label>
              <input type="number" min={0} value={form.price} onChange={(e) => set({ price: Number(e.target.value) })} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
                CPD Hours
              </label>
              <input type="number" min={0} value={form.cpdHours} onChange={(e) => set({ cpdHours: Number(e.target.value) })} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
                Seats
              </label>
              <input type="number" min={1} value={form.seats} onChange={(e) => set({ seats: Number(e.target.value) })} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
                Next Batch Date
              </label>
              <input value={form.nextBatch} onChange={(e) => set({ nextBatch: e.target.value })} placeholder="e.g. Aug 3, 2026" className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
                Status
              </label>
              <select value={form.status} onChange={(e) => set({ status: e.target.value })} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
                <option value="draft">Draft (hidden from catalog)</option>
                <option value="published">Published (visible to participants)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
              Description
            </label>
            <textarea value={form.description} onChange={(e) => set({ description: e.target.value })} rows={3} placeholder="What is this training about?" className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
          </div>

          <ListEditor label="Learning Objectives" items={form.objectives} onChange={(objectives) => set({ objectives })} placeholder="e.g. Explain the seven QMS principles" />

          <SyllabusEditor modules={form.syllabus} onChange={(syllabus) => set({ syllabus })} />

          <div>
            <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
              Prerequisites
            </label>
            <input value={form.prerequisites} onChange={(e) => set({ prerequisites: e.target.value })} placeholder="e.g. No prior experience required" className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
              Who Should Attend
            </label>
            <input value={form.audience} onChange={(e) => set({ audience: e.target.value })} placeholder="e.g. Quality managers and process owners" className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
          </div>

          <RelatedTrainingsPicker
            value={form.relatedTrainings || []}
            onChange={(relatedTrainings) => set({ relatedTrainings })}
            allTrainings={allTrainings}
            currentCategory={form.category}
            excludeTitle={form.title}
          />
        </div>

        <button
          onClick={() => onSave({ ...form, id: initial?.id ?? Date.now(), enrolled: initial?.enrolled ?? 0 })}
          disabled={!canSubmit}
          className="sticky bottom-0 mt-6 flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium text-white disabled:opacity-40"
          style={{ backgroundColor: COLORS.primary }}
        >
          Save Training
        </button>
      </div>
    </div>
  );
}

function TrainingsTab() {
  const [trainings, setTrainings] = useState(TRAININGS);
  const [editing, setEditing] = useState(null); // null = closed, {} won't happen, object = editing, "new" sentinel below
  const [showForm, setShowForm] = useState(false);
  const [contentTraining, setContentTraining] = useState(null);

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (t) => {
    setEditing(t);
    setShowForm(true);
  };
  const handleSave = (t) => {
    setTrainings((prev) => (prev.some((x) => x.id === t.id) ? prev.map((x) => (x.id === t.id ? t : x)) : [t, ...prev]));
    setShowForm(false);
  };

  return (
    <div>
      <SectionHeader
        title="Trainings"
        sub="Manage the catalog, schedules, and enrollment — including the description, objectives, and syllabus participants see"
        right={
          <button onClick={openNew} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
            + New Training
          </button>
        }
      />
      <div className="space-y-3">
        {trainings.map((t) => (
          <div key={t.id} className="flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: COLORS.ink }}>
                  {t.title}
                </span>
                <Pill color={t.status === "published" ? COLORS.sage : COLORS.ink60}>{t.status === "published" ? "Published" : "Draft"}</Pill>
                {!t.description && <Pill color={COLORS.amber}>Content Incomplete</Pill>}
              </div>
              <div className="mt-0.5 text-xs" style={{ color: COLORS.ink60 }}>
                {t.category} · Next batch: {t.nextBatch || "TBD"}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-sm font-medium">
                  {t.enrolled}/{t.seats}
                </div>
                <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                  Seats Filled
                </div>
              </div>
              <button onClick={() => setContentTraining(t)} className="rounded-md px-2.5 py-1.5 text-xs font-medium" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
                Manage Content
              </button>
              <button onClick={() => openEdit(t)} className="rounded-md px-2.5 py-1.5 text-xs font-medium" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
      {showForm && <TrainingFormPanel initial={editing} allTrainings={trainings} onClose={() => setShowForm(false)} onSave={handleSave} />}
      {contentTraining && <LessonContentPanel training={contentTraining} onClose={() => setContentTraining(null)} />}
    </div>
  );
}

// ---------------- Corporate Accounts ----------------
function CorporateDetailPanel({ company, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end" style={{ backgroundColor: "rgba(16,27,51,0.45)" }}>
      <div className="h-full w-full max-w-lg overflow-y-auto p-6" style={{ backgroundColor: COLORS.paper }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs" style={{ color: COLORS.ink60 }}>
              {company.industry} · Account manager: {company.manager}
            </div>
            <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="mt-0.5 text-xl font-semibold">
              {company.name}
            </h2>
            <div className="mt-1.5">
              <SourceBadge source={company.source} />
            </div>
          </div>
          <button onClick={onClose}>
            <X size={18} style={{ color: COLORS.ink60 }} />
          </button>
        </div>

        {company.status === "pending_activation" ? (
          <div className="mt-5 rounded-xl p-6" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <Pill color={COLORS.amber}>Pending Activation</Pill>
            <p className="mt-3 text-sm" style={{ color: COLORS.ink }}>
              This account was created directly by an operator and hasn't been activated by the client yet.
            </p>
            <div className="mt-4 space-y-2 text-xs" style={{ color: COLORS.ink60 }}>
              <div className="flex justify-between border-b pb-2" style={{ borderColor: COLORS.line }}>
                <span>PIC Name</span>
                <span style={{ color: COLORS.ink }}>{company.picName}</span>
              </div>
              <div className="flex justify-between border-b pb-2" style={{ borderColor: COLORS.line }}>
                <span>PIC Email</span>
                <span style={{ color: COLORS.ink }}>{company.picEmail}</span>
              </div>
              <div className="flex justify-between border-b pb-2" style={{ borderColor: COLORS.line }}>
                <span>Seats Allocated</span>
                <span style={{ color: COLORS.ink }}>{company.seatsPurchased}</span>
              </div>
              {company.note && (
                <div className="pt-1">
                  <span className="block">Internal Note</span>
                  <span style={{ color: COLORS.ink }}>{company.note}</span>
                </div>
              )}
            </div>
            <button className="mt-4 flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
              <Mail size={12} /> Resend Activation Invite
            </button>
          </div>
        ) : (
          <>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatTile Icon={Users2} accent={COLORS.primary} eyebrow="Employees Enrolled" value={company.employees} sub={`${company.seatsUsed}/${company.seatsPurchased} seats used`} />
          <StatTile Icon={BookOpen} accent={COLORS.cyan} eyebrow="Trainings Assigned" value={company.trainingBreakdown.length} sub="Programs assigned to staff" />
          <StatTile Icon={Calendar} accent={COLORS.violet} eyebrow="Avg. Completion Time" value={`${company.avgCompletionDays}d`} sub="From enrollment to finish" />
          <StatTile Icon={Smile} accent={COLORS.amber} eyebrow="Platform Satisfaction" value={`${company.satisfaction}/5`} sub="From post-training survey" />
        </div>

        <div className="mt-4 rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
            Progress Distribution
          </div>
          <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full">
            <div style={{ width: `${company.completedPct}%`, backgroundColor: COLORS.sage }} title="Completed" />
            <div style={{ width: `${company.inProgressPct}%`, backgroundColor: COLORS.cyan }} title="In Progress" />
            <div style={{ width: `${company.notStartedPct}%`, backgroundColor: COLORS.line }} title="Not Started" />
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-[11px]" style={{ color: COLORS.ink60 }}>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.sage }} /> Completed {company.completedPct}%
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.cyan }} /> In Progress {company.inProgressPct}%
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.line }} /> Not Started {company.notStartedPct}%
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg p-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
              <Percent size={11} /> Training Compliance
            </div>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", color: company.trainingCompliance < 70 ? COLORS.crimson : COLORS.ink }} className="mt-1 text-lg font-semibold">
              {company.trainingCompliance}%
            </div>
            <div className="text-[10px]" style={{ color: COLORS.ink60 }}>
              Assigned trainings completed on time
            </div>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
              <ShieldCheck size={11} /> CPD Compliance
            </div>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", color: company.cpdCompliance < 70 ? COLORS.crimson : COLORS.ink }} className="mt-1 text-lg font-semibold">
              {company.cpdCompliance}%
            </div>
            <div className="text-[10px]" style={{ color: COLORS.ink60 }}>
              Certified employees on track this cycle
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 text-sm font-medium" style={{ color: COLORS.ink }}>
            Per-Training Breakdown
          </div>
          <div className="space-y-2">
            {company.trainingBreakdown.map((t, i) => (
              <div key={i} className="rounded-lg p-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
                  {t.training}
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-sm font-semibold">
                      {t.assigned}
                    </div>
                    <div className="text-[9px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                      Assigned
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-sm font-semibold">
                      {t.certsIssued}
                    </div>
                    <div className="text-[9px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                      Certified
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.sage }} className="text-sm font-semibold">
                      {t.passed}
                    </div>
                    <div className="text-[9px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                      Passed
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "IBM Plex Mono, monospace", color: t.failed > 0 ? COLORS.crimson : COLORS.ink }} className="text-sm font-semibold">
                      {t.failed}
                    </div>
                    <div className="text-[9px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                      Failed
                    </div>
                  </div>
                </div>
                <div className="mt-1.5 text-[10px]" style={{ color: COLORS.ink60 }}>
                  Avg. completion time: {t.avgDays} days
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

const ACCOUNT_MANAGERS = ["Nadia Iskandar", "Fajar Ramadhan"];

function SourceBadge({ source }) {
  return source === "operator_assigned" ? (
    <Pill color={COLORS.violet}>Added by Operator</Pill>
  ) : (
    <Pill color={COLORS.ink60}>Self-Registered</Pill>
  );
}

function AddCorporateForm({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [picName, setPicName] = useState("");
  const [picEmail, setPicEmail] = useState("");
  const [seats, setSeats] = useState(10);
  const [manager, setManager] = useState(ACCOUNT_MANAGERS[0]);
  const [note, setNote] = useState("");

  const canSubmit = name.trim() && picName.trim() && picEmail.trim();

  return (
    <div className="fixed inset-0 z-40 flex justify-end" style={{ backgroundColor: "rgba(16,27,51,0.45)" }}>
      <div className="h-full w-full max-w-md overflow-y-auto p-6" style={{ backgroundColor: COLORS.paper }}>
        <div className="flex items-center justify-between">
          <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-xl font-semibold">
            Add Corporate Account
          </h2>
          <button onClick={onClose}>
            <X size={18} style={{ color: COLORS.ink60 }} />
          </button>
        </div>
        <p className="mt-1 text-xs" style={{ color: COLORS.ink60 }}>
          For clients onboarded outside self-registration — e.g. an offline contract or invoiced purchase order. The
          account starts as <strong>Pending Activation</strong> until the client's PIC logs in and employees are
          assigned to seats.
        </p>

        <div className="mt-5 space-y-3">
          <div>
            <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
              Company Name
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="PT Example Indonesia" className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
              Industry
            </label>
            <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Manufacturing" className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
                PIC Name
              </label>
              <input value={picName} onChange={(e) => setPicName(e.target.value)} placeholder="Contact person" className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
                PIC Email
              </label>
              <input value={picEmail} onChange={(e) => setPicEmail(e.target.value)} placeholder="pic@company.com" className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
                Seats to Allocate
              </label>
              <input type="number" min={1} value={seats} onChange={(e) => setSeats(Number(e.target.value))} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
                Account Manager
              </label>
              <select value={manager} onChange={(e) => setManager(e.target.value)} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
                {ACCOUNT_MANAGERS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
              Internal Note (optional)
            </label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="e.g. Annual contract signed Jul 2026, PO #4471…" className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
          </div>
        </div>

        <button
          onClick={() =>
            onCreate({
              id: Date.now(),
              name,
              industry: industry || "—",
              source: "operator_assigned",
              status: "pending_activation",
              employees: 0,
              seatsPurchased: seats,
              seatsUsed: 0,
              cpdCompliance: 0,
              trainingCompliance: 0,
              satisfaction: null,
              avgCompletionDays: null,
              notStartedPct: 100,
              inProgressPct: 0,
              completedPct: 0,
              manager,
              picName,
              picEmail,
              note,
              trainingBreakdown: [],
            })
          }
          disabled={!canSubmit}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium text-white disabled:opacity-40"
          style={{ backgroundColor: COLORS.primary }}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

function CorporateTab() {
  const [companies, setCompanies] = useState(CORPORATE_ACCOUNTS);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const handleCreate = (newCompany) => {
    setCompanies((prev) => [newCompany, ...prev]);
    setShowAdd(false);
  };

  return (
    <div>
      <SectionHeader
        title="Corporate Accounts"
        sub="Companies managing employee competency through DeAcademy — either self-registered at checkout, or provisioned directly by an operator for offline/contract clients"
        right={
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
            + Add Corporate Account
          </button>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {companies.map((c) => (
          <div key={c.id} className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${c.status === "pending_activation" ? COLORS.violet + "50" : COLORS.line}` }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: COLORS.ink }}>
                    {c.name}
                  </span>
                  {c.status === "pending_activation" && <Pill color={COLORS.amber}>Pending Activation</Pill>}
                </div>
                <div className="mt-0.5 text-xs" style={{ color: COLORS.ink60 }}>
                  {c.industry} · {c.trainingBreakdown.length} trainings assigned
                </div>
                <div className="mt-1.5">
                  <SourceBadge source={c.source} />
                </div>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${COLORS.primary}14` }}>
                <Building2 size={14} style={{ color: COLORS.primary }} />
              </div>
            </div>

            {c.status === "pending_activation" ? (
              <div className="mt-3 rounded-lg p-3 text-xs" style={{ backgroundColor: `${COLORS.violet}0F`, border: `1px solid ${COLORS.violet}30`, color: COLORS.ink }}>
                <div className="flex items-center gap-1.5">
                  <Mail size={12} style={{ color: COLORS.violet }} />
                  Invite sent to PIC: {c.picName} ({c.picEmail})
                </div>
                <div className="mt-1" style={{ color: COLORS.ink60 }}>
                  {c.seatsPurchased} seats allocated · awaiting first login to assign employees.
                </div>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md p-2" style={{ backgroundColor: COLORS.paper }}>
                  <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-sm font-semibold">
                    {c.seatsUsed}/{c.seatsPurchased}
                  </div>
                  <div className="text-[9px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                    Seats Used
                  </div>
                </div>
                <div className="rounded-md p-2" style={{ backgroundColor: COLORS.paper }}>
                  <div style={{ fontFamily: "IBM Plex Mono, monospace", color: c.trainingCompliance < 70 ? COLORS.crimson : COLORS.sage }} className="text-sm font-semibold">
                    {c.trainingCompliance}%
                  </div>
                  <div className="text-[9px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                    Training Compliance
                  </div>
                </div>
                <div className="rounded-md p-2" style={{ backgroundColor: COLORS.paper }}>
                  <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-sm font-semibold">
                    {c.satisfaction}/5
                  </div>
                  <div className="text-[9px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                    Satisfaction
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelected(c)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium"
              style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
            >
              {c.status === "pending_activation" ? "View Account Setup" : "View Full Breakdown"} <ChevronRight size={12} />
            </button>
          </div>
        ))}
      </div>
      {selected && <CorporateDetailPanel company={selected} onClose={() => setSelected(null)} />}
      {showAdd && <AddCorporateForm onClose={() => setShowAdd(false)} onCreate={handleCreate} />}
    </div>
  );
}

// ---------------- Staff Assignments ----------------
function StaffTab() {
  return (
    <div>
      <SectionHeader
        title="Staff Assignments"
        sub="Tutor and Examiner are separate roles — assign per training or cohort. The same person may hold one or both, depending on the assignment and training type."
        right={
          <button className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
            + New Assignment
          </button>
        }
      />
      <div className="space-y-3">
        {STAFF_ASSIGNMENTS.map((s) => (
          <div key={s.id} className="flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: COLORS.ink }}>
                  {s.name}
                </span>
                {s.roles.includes("tutor") && <Pill color={COLORS.cyan}>Tutor</Pill>}
                {s.roles.includes("examiner") && <Pill color={COLORS.crimson}>Examiner</Pill>}
              </div>
              <div className="mt-0.5 text-xs" style={{ color: COLORS.ink60 }}>
                {s.assignment}
              </div>
              <div className="mt-1 text-[11px]" style={{ color: COLORS.ink60 }}>
                {s.note}
              </div>
            </div>
            <button className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
              Edit Assignment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Certificates & CPD ----------------
function CertificatesTab() {
  return (
    <div className="space-y-8">
      <div>
        <SectionHeader title="Certificates & CPD Compliance" sub="Track issuance, refreshment cycles, and CPD status across all certificate holders" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile Icon={Award} accent={COLORS.sage} eyebrow="Active Certificates" value={totalActiveCerts} sub="Currently valid, LMS-wide" />
          <StatTile Icon={Clock} accent={COLORS.amber} eyebrow="Expiring Soon" value={totalExpiringSoon} sub="Within 60–90 days" />
          <StatTile Icon={ShieldCheck} accent={COLORS.ink60} eyebrow="No-Expiry Certificates" value={totalNoExpiry} sub="No CPD cycle attached" />
          <StatTile Icon={AlertTriangle} accent={COLORS.crimson} eyebrow="CPD Needs Updating" value={cpdNeedsUpdateCount} sub="Participants behind this cycle" />
        </div>
      </div>

      <div>
        <SectionHeader title="Certificates Issued by Training" sub="Issuance and status breakdown per program" />
        <div className="overflow-hidden rounded-lg" style={{ border: `1px solid ${COLORS.line}` }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ backgroundColor: COLORS.paper }}>
                {["Training", "Issued", "Active", "Expiring Soon", "No Expiry"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CERT_BY_TRAINING.map((c, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${COLORS.line}`, backgroundColor: COLORS.card }}>
                  <td className="px-4 py-2.5 text-sm font-medium" style={{ color: COLORS.ink }}>
                    {c.training}
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }}>
                    {c.issued}
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.sage }}>
                    {c.active}
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ fontFamily: "IBM Plex Mono, monospace", color: c.expiringSoon > 0 ? COLORS.amber : COLORS.ink60 }}>
                    {c.expiringSoon}
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink60 }}>
                    {c.noExpiry || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <SectionHeader title="Individual Certificate Status" sub="Per-holder refreshment and CPD tracking" />
        <div className="overflow-hidden rounded-lg" style={{ border: `1px solid ${COLORS.line}` }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ backgroundColor: COLORS.paper }}>
                {["Certificate", "Holder", "Issued", "Refresh By", "CPD Status", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CERT_COMPLIANCE.map((c) => (
                <tr key={c.id} style={{ borderTop: `1px solid ${COLORS.line}`, backgroundColor: COLORS.card }}>
                  <td className="px-4 py-2.5 text-sm font-medium" style={{ color: COLORS.ink }}>
                    {c.cert}
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: COLORS.ink60 }}>
                    {c.holder}
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: COLORS.ink60 }}>
                    {c.issued}
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: COLORS.ink60 }}>
                    {c.refreshBy}
                  </td>
                  <td className="px-4 py-2.5">
                    <CpdPill status={c.cpdStatus} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {c.cpdStatus === "Behind" && (
                      <button className="flex items-center gap-1 text-xs font-medium" style={{ color: COLORS.primary }}>
                        <Mail size={12} /> Remind
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const NAV = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutGrid },
  { key: "reports", label: "Reports & Analytics", Icon: BarChart3 },
  { key: "participants", label: "Participants", Icon: Users2 },
  { key: "trainings", label: "Trainings", Icon: BookOpen },
  { key: "corporate", label: "Corporate Accounts", Icon: Building2 },
  { key: "staff", label: "Staff Assignments", Icon: UserCog },
  { key: "certificates", label: "Certificates & CPD", Icon: ClipboardCheck },
];

const REPORT_SECTION_OPTIONS = [
  { key: "revenue", label: "Revenue Overview", desc: "Individual vs corporate, monthly trend, forecast" },
  { key: "participants", label: "Active Participants", desc: "This month, YTD, historical trend" },
  { key: "training", label: "Training Performance & Portfolio Decisions", desc: "Enrollment, completion, pass rate, Keep/Revise/Discontinue" },
  { key: "corporate", label: "Corporate Accounts Summary", desc: "Compliance, satisfaction, seat utilization per client" },
  { key: "certificates", label: "Certificates & CPD Compliance", desc: "Issued, active, expiring, participants behind on CPD" },
  { key: "staff", label: "Staff Performance", desc: "Tutor/examiner review turnaround and workload" },
];

function ReportBuilderModal({ onClose }) {
  const [selectedSections, setSelectedSections] = useState(REPORT_SECTION_OPTIONS.map((s) => s.key));
  const [period, setPeriod] = useState("This Month");
  const [generated, setGenerated] = useState(false);

  const toggleSection = (key) => setSelectedSections((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <div className="fixed inset-0 z-40 flex justify-end" style={{ backgroundColor: "rgba(16,27,51,0.45)" }}>
      <div className="h-full w-full max-w-md overflow-y-auto p-6" style={{ backgroundColor: COLORS.paper }}>
        <div className="flex items-center justify-between">
          <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-xl font-semibold">
            Generate Report
          </h2>
          <button onClick={onClose}>
            <X size={18} style={{ color: COLORS.ink60 }} />
          </button>
        </div>
        <p className="mt-1 text-xs" style={{ color: COLORS.ink60 }}>
          Pick a date range and only the sections you need — useful for a quick management update instead of a
          full analytics export.
        </p>

        <div className="mt-5">
          <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
            Period
          </label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
            {["This Month", "This Quarter", "This Year (YTD)", "Last 12 Months"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
              Sections to Include
            </label>
            <button onClick={() => setSelectedSections(selectedSections.length === REPORT_SECTION_OPTIONS.length ? [] : REPORT_SECTION_OPTIONS.map((s) => s.key))} className="text-xs font-medium" style={{ color: COLORS.primary }}>
              {selectedSections.length === REPORT_SECTION_OPTIONS.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          <div className="mt-2 space-y-1.5">
            {REPORT_SECTION_OPTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => toggleSection(s.key)}
                className="flex w-full items-start gap-2.5 rounded-lg p-3 text-left"
                style={{ backgroundColor: selectedSections.includes(s.key) ? `${COLORS.primary}0C` : COLORS.card, border: `1px solid ${selectedSections.includes(s.key) ? COLORS.primary : COLORS.line}` }}
              >
                {selectedSections.includes(s.key) ? <FileCheck size={15} style={{ color: COLORS.primary }} className="mt-0.5 shrink-0" /> : <div className="mt-0.5 h-[15px] w-[15px] shrink-0 rounded border" style={{ borderColor: COLORS.line }} />}
                <div>
                  <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
                    {s.label}
                  </div>
                  <div className="text-[11px]" style={{ color: COLORS.ink60 }}>
                    {s.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {generated && (
          <div className="mt-4 flex items-center gap-2 rounded-lg p-3 text-xs" style={{ backgroundColor: `${COLORS.sage}12`, border: `1px solid ${COLORS.sage}35`, color: COLORS.ink }}>
            <FileCheck size={14} style={{ color: COLORS.sage }} /> Report ready — "{period}" · {selectedSections.length} section{selectedSections.length !== 1 ? "s" : ""}.
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setGenerated(true)}
            disabled={selectedSections.length === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: COLORS.primary }}
          >
            <FileDown size={14} /> Generate PDF
          </button>
          {generated && (
            <button className="flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
              <Download size={14} /> Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OperatorDashboard() {
  const [tab, setTab] = useState("dashboard");
  const [showReportBuilder, setShowReportBuilder] = useState(false);

  return (
    <div className="flex min-h-screen w-full" style={{ backgroundColor: COLORS.paper, fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
      `}</style>

      <aside className="hidden w-60 shrink-0 flex-col justify-between p-5 sm:flex" style={{ backgroundColor: COLORS.primaryDeep }}>
        <div>
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: COLORS.primary }}>
              <Award size={16} color="#fff" />
            </div>
            <span style={{ fontFamily: "Fraunces, serif" }} className="text-sm font-semibold text-white">
              DeAcademy
            </span>
          </div>
          <nav className="space-y-1">
            {NAV.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors"
                style={{ backgroundColor: tab === key ? "rgba(255,255,255,0.10)" : "transparent", color: tab === key ? "#fff" : "rgba(255,255,255,0.55)" }}
              >
                <Icon size={15} />
                {label}
                {tab === key && <ChevronRight size={13} className="ml-auto" />}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 rounded-md px-2 py-2" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.16)" }}>
            <UserCog size={14} color="#fff" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-medium text-white">Nadia Iskandar</div>
            <div className="truncate text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>
              LMS Operator
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 px-5 py-6 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs" style={{ color: COLORS.ink60 }}>
              DeAcademy Operator Console
            </div>
            <div style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-lg font-semibold">
              {NAV.find((n) => n.key === tab)?.label}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReportBuilder(true)}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white"
              style={{ backgroundColor: COLORS.primary }}
            >
              <FileDown size={13} /> Generate Report
            </button>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <Bell size={15} style={{ color: COLORS.ink }} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-semibold text-white" style={{ backgroundColor: COLORS.crimson }}>
                {ALERTS.length}
              </span>
            </button>
          </div>
        </div>

        {tab === "dashboard" && <DashboardTab />}
        {tab === "reports" && <ReportsTab />}
        {tab === "participants" && <ParticipantsTab />}
        {tab === "trainings" && <TrainingsTab />}
        {tab === "corporate" && <CorporateTab />}
        {tab === "staff" && <StaffTab />}
        {tab === "certificates" && <CertificatesTab />}
        {showReportBuilder && <ReportBuilderModal onClose={() => setShowReportBuilder(false)} />}
      </main>
    </div>
  );
}

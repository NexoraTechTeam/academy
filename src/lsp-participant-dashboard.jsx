/* ============================================================================
   DeAcademy portal prototype — v3 context note (2026-08-24)

   The current integrated prototype is the unified app (`lsp-unified-app.html`):
   one login, one shell, a workspace switcher across roles (incl. the new
   Super Admin workspace), guest browsing, and attribute-driven upsells.
   This file remains the detailed per-workspace feature reference.

   v3 additions here: My Profile tab with the master-data Position dropdown.

   Cross-references: docs/PRD.md §4.9–4.11 & §5a, docs/DATA-MODEL.md §1.1 & §9,
   src/positions-master-data.js (position master data + upsell rules).
   ============================================================================ */
import React, { useState } from "react";
import {
  BookOpen,
  Award,
  ClipboardCheck,
  User,
  Bell,
  ChevronRight,
  Upload,
  Download,
  Clock,
  CheckCircle2,
  CircleDashed,
  CalendarClock,
  TimerReset,
  AlertTriangle,
  LayoutGrid,
  HelpCircle,
  PenSquare,
  Wrench,
  Sparkles,
  Users2,
  Info,
  CreditCard,
  Link2,
  Eye,
  EyeOff,
  Building2,
  Check,
  X,
  ShieldCheck,
  QrCode,
  Copy,
  RotateCw,
  Crown,
} from "lucide-react";
import { POSITIONS, POSITION_CATEGORIES, isHrFamily } from "./positions-master-data";

// ---------- Palette ----------
// Inspired by a modern connectivity/SaaS blue tone. Exact hex not yet confirmed
// from the reference site (it's a JS-rendered page I couldn't visually inspect) —
// swap these tokens once real brand hex codes are available.
const COLORS = {
  paper: "#F4F6FB",
  card: "#FFFFFF",
  ink: "#101B33",
  ink60: "#5B6B85",
  primary: "#2952E3", // OneConnect-style corporate blue
  primaryDeep: "#17307D",
  cyan: "#0EA5A0", // secondary accent, "connected/active" states
  amber: "#D68A1F",
  sage: "#2E9E5B",
  violet: "#6D5BD0", // used sparingly for "recommended" tags
  crimson: "#B4402E", // suspended / lapsed / dormant severity
  line: "#E3E7F0",
};

// ---------- Mock data ----------
const myTrainings = [
  {
    id: 1,
    title: "Corporate H&S Regulation Awareness",
    category: "Internal · Compliance",
    status: "completed",
    progress: 100,
    note: "Completed May 12, 2026",
    certIssued: true,
  },
  {
    id: 2,
    title: "Training Proposal Writing Techniques",
    category: "Internal · Skill Development",
    status: "in_progress",
    progress: 60,
    note: "Due Aug 20, 2026",
    quiz: { total: 6, done: 4 },
    exercise: { total: 3, done: 2 },
    workshop: { total: 1, done: 0 },
  },
  {
    id: 3,
    title: "KKNI-Based Competency Assessment",
    category: "Professional Certification",
    status: "in_progress",
    progress: 35,
    note: "Due Sep 5, 2026",
    quiz: { total: 8, done: 2 },
    exercise: { total: 4, done: 1 },
    workshop: { total: 2, done: 0 },
  },
  {
    id: 4,
    title: "Project Risk Management",
    category: "General Development",
    status: "upcoming",
    startDate: "Aug 1, 2026",
  },
  {
    id: 5,
    title: "Assessor Code of Ethics",
    category: "Professional Certification",
    status: "completed",
    progress: 100,
    note: "Completed Feb 2, 2026",
    certIssued: true,
  },
  {
    id: 6,
    title: "Internal Audit Fundamentals",
    category: "Professional Certification",
    status: "upcoming",
    startDate: "Aug 15, 2026",
  },
];

const recommendedTrainings = [
  {
    id: 101,
    title: "ISO 9001:2015 Quality Management",
    category: "Professional Certification",
    reason: "Related to \u201cCompetency Assessor Certification (BNSP)\u201d, which you completed",
    nextSchedule: "Jul 22, 2026",
    seatsLeft: 8,
  },
  {
    id: 102,
    title: "Internal Audit Fundamentals",
    category: "Professional Certification",
    reason: "Related to \u201cCompetency Assessor Certification (BNSP)\u201d, which you completed",
    nextSchedule: "Aug 5, 2026",
    seatsLeft: 12,
  },
  {
    id: 103,
    title: "2026 H&S Regulation Update",
    category: "Internal · Compliance",
    reason: "Your annual refreshment is coming due",
    nextSchedule: "Jul 29, 2026",
    seatsLeft: 15,
  },
];

const certificates = [
  {
    id: 1,
    name: "Competency Assessor Certificate",
    issuer: "DeAcademy",
    issueDate: "Feb 2, 2026",
    expiryDate: "Feb 2, 2029",
    source: "lms",
    requiresCpd: true,
    cpdRequiredAnnual: 40,
    status: "active",
    statusNote: "24/40 hrs logged — on track for the Dec 31, 2026 deadline.",
  },
  {
    id: 2,
    name: "H&S Regulation Awareness Certificate",
    issuer: "DeAcademy",
    issueDate: "May 12, 2026",
    expiryDate: "May 12, 2027",
    source: "lms",
    requiresCpd: false,
    status: "active",
    nextRelevanceCheck: "May 12, 2029",
  },
  {
    id: 3,
    name: "Certified Project Management Associate",
    issuer: "PMI Indonesia",
    issueDate: "Nov 14, 2024",
    expiryDate: "Nov 14, 2027",
    source: "manual",
    requiresCpd: true,
    cpdRequiredAnnual: 20,
    status: "grace_period",
    graceDaysLeft: 12,
    statusNote: "CPD cycle ended Jul 10, 2026 — submit remaining hours within 12 days to avoid suspension.",
  },
  {
    id: 4,
    name: "Certified Internal Facilitator",
    issuer: "Nusantara Training Institute",
    issueDate: "Jun 15, 2023",
    expiryDate: "No expiry",
    source: "manual",
    requiresCpd: false,
    status: "attestation_due",
    nextRelevanceCheck: "Jun 15, 2026",
  },
];

// CPD structure modeled after a typical personnel-certification CPD policy:
// 1 CPD hour = 50 minutes of activity; annual minimum plus a rolling
// 3-year cumulative requirement; a few categories carry an annual cap.
const cpdPrograms = [
  {
    certId: 1,
    certName: "Competency Assessor Certificate",
    cycle: "Year 1 of 3-year cycle (2026–2028)",
    requiredAnnual: 40,
    requiredTriennial: 120,
    categories: [
      { label: "Training", hours: 14, cap: null, color: COLORS.primary },
      { label: "Webinar", hours: 6, cap: 36, color: COLORS.cyan },
      { label: "Exam Question Development", hours: 4, cap: null, color: COLORS.violet },
    ],
  },
  {
    certId: 3,
    certName: "Certified Project Management Associate",
    cycle: "Year 2 of 3-year cycle (2025–2027)",
    requiredAnnual: 20,
    requiredTriennial: 60,
    categories: [
      { label: "Training", hours: 12, cap: null, color: COLORS.primary },
      { label: "Webinar", hours: 5, cap: 36, color: COLORS.cyan },
      { label: "Mentoring", hours: 3, cap: 10, color: COLORS.amber },
    ],
  },
];

const reminders = [
  { id: 1, text: "\u201cTraining Proposal Writing Techniques\u201d isn't finished yet — due Aug 20, 2026", tone: "amber" },
  { id: 2, text: "Competency Assessor CPD is only 60% complete — submission deadline Dec 31, 2026", tone: "amber" },
  { id: 3, text: "3 relevant trainings available, nearest schedule Jul 22, 2026", tone: "neutral" },
];

// ---------- Membership, billing, portfolio & verifier data ----------
const MEMBERSHIP_INITIAL = {
  plan: "Premium",
  price: 49000,
  billingCycle: "Monthly",
  renewalDate: "Jul 28, 2026",
  autoRenew: true,
  paymentMethod: "Visa •••• 4821",
};

const BILLING_HISTORY_INITIAL = [
  { date: "Jun 28, 2026", desc: "Premium Membership — Monthly", amount: 49000, status: "Paid" },
  { date: "May 28, 2026", desc: "Premium Membership — Monthly", amount: 49000, status: "Paid" },
  { date: "Apr 28, 2026", desc: "Premium Membership — Monthly", amount: 49000, status: "Paid" },
];

const VERIFIER_REQUESTS_INITIAL = [
  { id: 1, company: "PT Cakra Teknologi Indonesia", requestedAt: "Jul 18, 2026", status: "pending", reason: "Reference check for Senior QA Engineer position" },
  { id: 2, company: "Bank Nusantara Sejahtera", requestedAt: "Jul 10, 2026", status: "approved", reason: "Pre-employment competency verification" },
  { id: 3, company: "PT Solusi Karya Digital", requestedAt: "Jun 22, 2026", status: "denied", reason: "Background check for contractor role" },
];

const PROFILE_VIEWS = {
  thisMonth: 14,
  lastMonth: 9,
  publicLinkViews: 8,
  searchAppearances: 6,
};

function formatIDR(v) {
  return "Rp " + v.toLocaleString("id-ID");
}

// ---------- Small building blocks ----------
function StatusPill({ status }) {
  const map = {
    completed: { label: "Completed", color: COLORS.sage, Icon: CheckCircle2 },
    in_progress: { label: "In Progress", color: COLORS.cyan, Icon: Clock },
    not_started: { label: "Not Started", color: COLORS.ink60, Icon: CircleDashed },
    upcoming: { label: "Upcoming", color: COLORS.violet, Icon: CalendarClock },
  };
  const { label, color, Icon } = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ color, backgroundColor: `${color}17`, border: `1px solid ${color}35` }}
    >
      <Icon size={12} strokeWidth={2.5} />
      {label}
    </span>
  );
}

function ProgressBar({ value, color }) {
  return (
    <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: COLORS.line }}>
      <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}

function MiniTaskChip({ Icon, done, total, label, color }) {
  const remaining = total - done;
  if (remaining <= 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px]" style={{ color: COLORS.sage, backgroundColor: `${COLORS.sage}14` }}>
        <CheckCircle2 size={11} /> {label} complete
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px]" style={{ color, backgroundColor: `${color}14` }}>
      <Icon size={11} /> {remaining} of {total} {label} remaining
    </span>
  );
}

function TrainingTaskChips({ t }) {
  if (t.status !== "in_progress") return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {t.quiz && <MiniTaskChip Icon={HelpCircle} done={t.quiz.done} total={t.quiz.total} label="quizzes" color={COLORS.amber} />}
      {t.exercise && <MiniTaskChip Icon={PenSquare} done={t.exercise.done} total={t.exercise.total} label="exercises" color={COLORS.primary} />}
      {t.workshop && <MiniTaskChip Icon={Wrench} done={t.workshop.done} total={t.workshop.total} label="workshops" color={COLORS.violet} />}
    </div>
  );
}

// Signature element: connectivity-style progress ring (nodes along the arc,
// echoing a "network / one-connect" motif) for overall competency score.
function CompetencySeal({ percent }) {
  const size = 176;
  const stroke = 8;
  const r = (size - stroke) / 2 - 10;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  const nodeCount = 12;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS.line} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={COLORS.primary}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          {Array.from({ length: nodeCount }).map((_, i) => {
            const angle = (i / nodeCount) * 360;
            const active = angle <= percent * 3.6;
            const rad = (angle * Math.PI) / 180;
            const x = r * Math.cos(rad);
            const y = r * Math.sin(rad);
            return <circle key={i} cx={x} cy={y} r={active ? 3 : 2} fill={active ? COLORS.primary : COLORS.line} />;
          })}
        </g>
      </svg>
      <div className="flex flex-col items-center">
        <span style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-4xl font-semibold">
          {percent}%
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: COLORS.ink60 }}>
          Verified Competency
        </span>
      </div>
    </div>
  );
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
      <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="mt-2 text-2xl font-semibold">
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
    <div className="mb-4 flex items-end justify-between">
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

// ---------- Tabs ----------
function DashboardTab() {
  const ongoing = myTrainings.filter((t) => t.status === "in_progress");
  const upcoming = myTrainings.filter((t) => t.status === "upcoming");
  const done = myTrainings.filter((t) => t.status === "completed");
  const nearestSchedule = recommendedTrainings[0]?.nextSchedule;

  return (
    <div className="space-y-8">
      <div className="rounded-xl p-6" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <CompetencySeal percent={68} />
          <div className="grid flex-1 grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile Icon={BookOpen} accent={COLORS.primary} eyebrow="Trainings Enrolled" value={myTrainings.length} sub={`${done.length} completed · ${ongoing.length} in progress · ${upcoming.length} upcoming`} />
            <StatTile Icon={Award} accent={COLORS.sage} eyebrow="Certificates Held" value={certificates.length} sub={`${certificates.filter((c) => c.source === "lms").length} from LMS · ${certificates.filter((c) => c.source === "manual").length} manual`} />
            <StatTile Icon={ClipboardCheck} accent={COLORS.amber} eyebrow="CPD Hours This Year" value="24 / 40" sub="Submission deadline Dec 31, 2026" />
            <StatTile Icon={Sparkles} accent={COLORS.violet} eyebrow="Relevant Trainings Available" value={recommendedTrainings.length} sub={`Nearest schedule ${nearestSchedule}`} />
          </div>
        </div>
      </div>

      <div>
        <SectionHeader title="In-Progress Trainings" sub="Progress and remaining tasks to complete" />
        <div className="space-y-3">
          {ongoing.map((t) => (
            <div key={t.id} className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium" style={{ color: COLORS.ink }}>
                    {t.title}
                  </div>
                  <div className="mt-0.5 text-xs" style={{ color: COLORS.ink60 }}>
                    {t.category} · {t.note}
                  </div>
                </div>
                <StatusPill status={t.status} />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <ProgressBar value={t.progress} color={COLORS.cyan} />
                <span className="whitespace-nowrap text-xs" style={{ color: COLORS.ink60 }}>
                  {t.progress}%
                </span>
              </div>
              <TrainingTaskChips t={t} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader title="Upcoming Trainings" sub="Already enrolled, waiting for the start date" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {upcoming.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div>
                <div className="text-sm font-medium" style={{ color: COLORS.ink }}>
                  {t.title}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs" style={{ color: COLORS.ink60 }}>
                  <CalendarClock size={12} /> Starts {t.startDate}
                </div>
              </div>
              <StatusPill status={t.status} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader title="Reminders" sub="Things that need your attention" />
        <div className="space-y-2">
          {reminders.map((r) => (
            <div
              key={r.id}
              className="flex items-start gap-3 rounded-lg px-4 py-3"
              style={{ backgroundColor: r.tone === "amber" ? `${COLORS.amber}12` : COLORS.card, border: `1px solid ${r.tone === "amber" ? COLORS.amber + "40" : COLORS.line}` }}
            >
              <AlertTriangle size={16} style={{ color: r.tone === "amber" ? COLORS.amber : COLORS.ink60 }} className="mt-0.5 shrink-0" />
              <span className="text-sm" style={{ color: COLORS.ink }}>
                {r.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrainingsTab() {
  return (
    <div className="space-y-10">
      <div>
        <SectionHeader title="My Trainings" sub="Every training you've purchased or enrolled in" />
        <div className="space-y-3">
          {myTrainings.map((t) => (
            <div key={t.id} className="flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: COLORS.ink }}>
                    {t.title}
                  </span>
                  {t.certIssued && <Award size={14} style={{ color: COLORS.primary }} />}
                </div>
                <div className="mt-0.5 text-xs" style={{ color: COLORS.ink60 }}>
                  {t.category} · {t.status === "upcoming" ? `Starts ${t.startDate}` : t.note}
                </div>
                {t.status !== "upcoming" && (
                  <div className="mt-2 max-w-xs">
                    <ProgressBar value={t.progress} color={t.status === "completed" ? COLORS.sage : COLORS.cyan} />
                  </div>
                )}
                <TrainingTaskChips t={t} />
              </div>
              <div className="flex items-center gap-3">
                <StatusPill status={t.status} />
                <button
                  className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium text-white"
                  style={{ backgroundColor: t.status === "completed" ? COLORS.ink60 : COLORS.primary }}
                >
                  {t.status === "completed" ? "View Details" : t.status === "in_progress" ? "Continue" : "View Schedule"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader
          title="Recommended for You"
          sub="Relevant to your competencies, not yet enrolled"
          right={
            <span className="hidden items-center gap-1 text-xs sm:flex" style={{ color: COLORS.ink60 }}>
              <Info size={12} /> Curated by DeAcademy from trainings related to what you've completed
            </span>
          }
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedTrainings.map((t) => (
            <div key={t.id} className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.violet}35` }}>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide" style={{ color: COLORS.violet, backgroundColor: `${COLORS.violet}14` }}>
                <Sparkles size={10} /> Recommended
              </span>
              <div className="mt-2 text-sm font-medium" style={{ color: COLORS.ink }}>
                {t.title}
              </div>
              <div className="mt-1 text-xs" style={{ color: COLORS.ink60 }}>
                {t.category}
              </div>
              <div className="mt-2 text-xs" style={{ color: COLORS.ink60 }}>
                {t.reason}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs" style={{ color: COLORS.ink }}>
                <span className="flex items-center gap-1">
                  <CalendarClock size={12} /> {t.nextSchedule}
                </span>
                <span className="flex items-center gap-1" style={{ color: COLORS.ink60 }}>
                  <Users2 size={12} /> {t.seatsLeft} seats left
                </span>
              </div>
              <button className="mt-3 w-full rounded-md py-1.5 text-xs font-medium text-white" style={{ backgroundColor: COLORS.violet }}>
                Enroll Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const CERT_STATUS_META = {
  active: { label: "Active", color: COLORS.sage },
  grace_period: { label: "Grace Period", color: COLORS.amber },
  suspended: { label: "Suspended", color: COLORS.crimson },
  lapsed: { label: "Lapsed", color: COLORS.crimson },
  attestation_due: { label: "Attestation Due", color: COLORS.amber },
  dormant: { label: "Dormant", color: COLORS.crimson },
};

function RelevanceEvidenceForm({ cert, onClose, onSubmit }) {
  const [evidenceType, setEvidenceType] = useState("project_log");
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [requestEmployer, setRequestEmployer] = useState(false);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-5" style={{ backgroundColor: "rgba(16,27,51,0.5)" }}>
      <div className="w-full max-w-md rounded-xl p-6" style={{ backgroundColor: COLORS.card }}>
        <h3 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-lg font-semibold">
          Confirm Competency Currency
        </h3>
        <p className="mt-1 text-xs" style={{ color: COLORS.ink60 }}>
          "{cert.name}" doesn't require CPD, but every 3 years we ask for a quick check that you're still applying
          this competency at work — this keeps the certificate meaningful to anyone verifying it.
        </p>

        <div className="mt-4">
          <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
            Evidence Type
          </label>
          <select value={evidenceType} onChange={(e) => setEvidenceType(e.target.value)} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
            <option value="project_log">Project Log</option>
            <option value="workload_letter">Workload / Assignment Letter</option>
            <option value="work_sample">Work Sample / Portfolio Piece</option>
          </select>
        </div>

        <div className="mt-3">
          <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md py-2.5 text-xs font-medium" style={{ border: `1px dashed ${COLORS.line}`, color: COLORS.ink60 }}>
            <Upload size={13} /> {file || "Upload supporting file"}
            <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0].name)} />
          </label>
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Briefly describe how you've used this competency in the last 3 years…"
          className="mt-3 w-full rounded-md p-2.5 text-sm outline-none"
          style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
        />

        <label className="mt-3 flex items-center gap-2 text-xs" style={{ color: COLORS.ink }}>
          <input type="checkbox" checked={requestEmployer} onChange={(e) => setRequestEmployer(e.target.checked)} />
          Ask my employer to co-sign this attestation (stronger verification badge)
        </label>

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-md py-2.5 text-sm font-medium" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
            Cancel
          </button>
          <button
            onClick={() => onSubmit(cert.id, requestEmployer)}
            disabled={!file}
            className="flex-1 rounded-md py-2.5 text-sm font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: COLORS.primary }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

function CertificateCard({ cert, onOpenEvidence, evidenceStatus }) {
  const meta = CERT_STATUS_META[cert.status];
  const needsAction = cert.status === "grace_period" || cert.status === "suspended" || cert.status === "lapsed" || cert.status === "attestation_due" || cert.status === "dormant";

  return (
    <div className="relative overflow-hidden rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${needsAction ? meta.color + "50" : COLORS.line}` }}>
      <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${COLORS.primary}14` }}>
        <Award size={16} style={{ color: COLORS.primary }} />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className="inline-block rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
          style={{ color: cert.source === "lms" ? COLORS.cyan : COLORS.amber, backgroundColor: cert.source === "lms" ? `${COLORS.cyan}14` : `${COLORS.amber}14` }}
        >
          {cert.source === "lms" ? "Issued by LMS" : "Manually Uploaded"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: meta.color, backgroundColor: `${meta.color}14` }}>
          {meta.label}
        </span>
      </div>
      <div className="mt-2 pr-8 text-sm font-medium" style={{ color: COLORS.ink }}>
        {cert.name}
      </div>
      <div className="mt-1 text-xs" style={{ color: COLORS.ink60 }}>
        {cert.issuer}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs" style={{ color: COLORS.ink60 }}>
        <span>Issued {cert.issueDate}</span>
        <span>Valid until {cert.expiryDate}</span>
      </div>

      <div
        className="mt-3 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px]"
        style={{ color: cert.requiresCpd ? COLORS.amber : COLORS.ink60, backgroundColor: cert.requiresCpd ? `${COLORS.amber}12` : `${COLORS.line}80` }}
      >
        <ClipboardCheck size={12} />
        {cert.requiresCpd ? `CPD required · ${cert.cpdRequiredAnnual} hrs/year` : "No CPD required — 3-year competency currency check"}
      </div>

      {needsAction && (
        <div className="mt-2 rounded-md p-2.5 text-[11px]" style={{ backgroundColor: `${meta.color}12`, color: COLORS.ink }}>
          {cert.statusNote || (cert.status === "attestation_due" ? "3-year check due — confirm you're still using this competency at work." : "Action needed to keep this certificate active.")}
        </div>
      )}

      {(cert.status === "attestation_due" || cert.status === "dormant") &&
        (evidenceStatus === "submitted" ? (
          <div className="mt-2 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px]" style={{ backgroundColor: `${COLORS.cyan}12`, color: COLORS.ink }}>
            <Clock size={11} style={{ color: COLORS.cyan }} /> Evidence submitted — pending verification
          </div>
        ) : (
          <button onClick={() => onOpenEvidence(cert)} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
            Submit Relevance Evidence
          </button>
        ))}

      {(cert.status === "grace_period" || cert.status === "suspended") && (
        <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
          Go to CPD / CPE
        </button>
      )}

      <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
        <Download size={12} /> Download
      </button>
    </div>
  );
}

function CertificatesTab() {
  const [evidenceCert, setEvidenceCert] = useState(null);
  const [evidenceStatuses, setEvidenceStatuses] = useState({});

  const handleSubmitEvidence = (certId, requestEmployer) => {
    setEvidenceStatuses((prev) => ({ ...prev, [certId]: "submitted" }));
    setEvidenceCert(null);
  };

  return (
    <div>
      <SectionHeader title="Certificates & Competency" sub="Evidence of competency you hold, from the LMS or self-uploaded — with live status" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((c) => (
          <CertificateCard key={c.id} cert={c} onOpenEvidence={setEvidenceCert} evidenceStatus={evidenceStatuses[c.id]} />
        ))}
        <button className="flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-lg text-sm" style={{ border: `1.5px dashed ${COLORS.line}`, color: COLORS.ink60 }}>
          <Upload size={18} />
          Upload External Certificate
        </button>
      </div>

      <div className="mt-5 rounded-lg p-4 text-xs" style={{ backgroundColor: `${COLORS.primary}0A`, border: `1px solid ${COLORS.primary}30`, color: COLORS.ink }}>
        <strong>How status works:</strong> CPD-required certificates move Active → Grace Period → Suspended →
        Lapsed if hours aren't kept current (Lapsed requires re-assessment to reactivate). Certificates that don't
        need CPD instead ask for a competency currency check every 3 years — a quick evidence submission confirming
        you're still using the skill, which can optionally be co-signed by your employer for a stronger verification
        badge.
      </div>

      {evidenceCert && <RelevanceEvidenceForm cert={evidenceCert} onClose={() => setEvidenceCert(null)} onSubmit={handleSubmitEvidence} />}
    </div>
  );
}

function CpdProgramCard({ program }) {
  const completed = program.categories.reduce((a, c) => a + c.hours, 0);
  const percent = Math.min(100, Math.round((completed / program.requiredAnnual) * 100));
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-sm font-medium" style={{ color: COLORS.ink }}>
            {program.certName}
          </div>
          <div className="mt-0.5 text-xs" style={{ color: COLORS.ink60 }}>
            {program.cycle}
          </div>
        </div>
        <span style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-sm">
          {completed} / {program.requiredAnnual} hrs
        </span>
      </div>

      <div className="mt-3">
        <ProgressBar value={percent} color={percent >= 100 ? COLORS.sage : COLORS.amber} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs" style={{ color: COLORS.ink60 }}>
        <span>3-year target: {program.requiredTriennial} hrs</span>
        {percent < 100 && (
          <span className="flex items-center gap-1" style={{ color: COLORS.amber }}>
            <TimerReset size={12} /> {program.requiredAnnual - completed} hrs remaining
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2.5">
        {program.categories.map((c) => (
          <div key={c.label}>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: COLORS.ink }}>
                {c.label}
                {c.cap && <span style={{ color: COLORS.ink60 }}> · capped at {c.cap} hrs/year</span>}
              </span>
              <span style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink60 }}>{c.hours} hrs</span>
            </div>
            <div className="mt-1">
              <ProgressBar value={(c.hours / program.requiredAnnual) * 100} color={c.color} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CpdTab() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Annual CPD / CPE" sub="Continuous Professional Development per certification you hold" />

      <div className="space-y-4">
        {cpdPrograms.map((p) => (
          <CpdProgramCard key={p.certId} program={p} />
        ))}
      </div>

      <div className="rounded-xl p-5" style={{ backgroundColor: `${COLORS.primary}0A`, border: `1px solid ${COLORS.primary}30` }}>
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: COLORS.primaryDeep }}>
          <Info size={14} /> General CPD Rules
        </div>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs" style={{ color: COLORS.ink60 }}>
          <li>1 CPD hour equals 50 minutes of effective activity (excluding breaks).</li>
          <li>Must be submitted annually, with a minimum cumulative total across a 3-year certification cycle.</li>
          <li>Webinar and Mentoring categories have an annual hour cap; other categories are uncapped.</li>
          <li>Certifications may be randomly audited — keep supporting evidence for every CPD activity.</li>
        </ul>
      </div>

      <button className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
        <Upload size={14} /> Submit New CPD Activity
      </button>
    </div>
  );
}

function MembershipTab() {
  const [membership, setMembership] = useState(MEMBERSHIP_INITIAL);
  const [billingHistory, setBillingHistory] = useState(BILLING_HISTORY_INITIAL);
  const [justRenewed, setJustRenewed] = useState(false);
  const [portfolioPublic, setPortfolioPublic] = useState(true);
  const [consentLevel, setConsentLevel] = useState("request"); // full | partial | request
  const [certVisibility, setCertVisibility] = useState(() => Object.fromEntries(certificates.map((c) => [c.id, true])));
  const [requests, setRequests] = useState(VERIFIER_REQUESTS_INITIAL);
  const [copied, setCopied] = useState(false);

  const isPremium = membership.plan === "Premium";
  const portfolioUrl = "deacademy.id/p/dinda-pramesti";

  const addMonth = (dateStr) => {
    const d = new Date(dateStr + ", 2026");
    d.setMonth(d.getMonth() + 1);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleRenew = () => {
    const newDate = addMonth(membership.renewalDate);
    setBillingHistory((prev) => [{ date: membership.renewalDate, desc: "Premium Membership — Monthly", amount: membership.price, status: "Paid" }, ...prev]);
    setMembership((m) => ({ ...m, renewalDate: newDate }));
    setJustRenewed(true);
  };

  const toggleCertVisibility = (id) => setCertVisibility((prev) => ({ ...prev, [id]: !prev[id] }));

  const respondRequest = (id, status) => setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  return (
    <div className="space-y-8">
      <div>
        <SectionHeader title="Membership" sub="Your subscription controls the public, shareable version of your competency portfolio" />

        {justRenewed && (
          <div className="mb-3 flex items-center gap-2 rounded-lg p-3 text-xs" style={{ backgroundColor: `${COLORS.sage}12`, border: `1px solid ${COLORS.sage}35`, color: COLORS.ink }}>
            <Check size={14} style={{ color: COLORS.sage }} /> Renewed — your membership is now active until {membership.renewalDate}.
          </div>
        )}

        <div className="rounded-xl p-6" style={{ backgroundColor: COLORS.card, border: `1px solid ${isPremium ? COLORS.primary + "40" : COLORS.line}` }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${COLORS.primary}14` }}>
                <Crown size={16} style={{ color: COLORS.primary }} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>
                  {membership.plan} Plan
                </div>
                <div className="text-xs" style={{ color: COLORS.ink60 }}>
                  {formatIDR(membership.price)} / {membership.billingCycle.toLowerCase()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs" style={{ color: COLORS.ink60 }}>
                Renews on
              </div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-sm font-semibold">
                {membership.renewalDate}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg p-3" style={{ backgroundColor: COLORS.paper }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: COLORS.ink }}>
              <CreditCard size={13} style={{ color: COLORS.ink60 }} /> {membership.paymentMethod}
            </div>
            <label className="flex items-center gap-2 text-xs" style={{ color: COLORS.ink60 }}>
              Auto-renew
              <button
                onClick={() => setMembership((m) => ({ ...m, autoRenew: !m.autoRenew }))}
                className="relative h-5 w-9 rounded-full transition-colors"
                style={{ backgroundColor: membership.autoRenew ? COLORS.primary : COLORS.line }}
              >
                <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all" style={{ left: membership.autoRenew ? 18 : 2 }} />
              </button>
            </label>
          </div>

          {!membership.autoRenew && (
            <div className="mt-3 flex items-center gap-2 rounded-lg p-3 text-xs" style={{ backgroundColor: `${COLORS.amber}12`, border: `1px solid ${COLORS.amber}35`, color: COLORS.ink }}>
              <AlertTriangle size={13} style={{ color: COLORS.amber }} /> Auto-renew is off — your public portfolio and PDF export will be disabled after {membership.renewalDate} unless you renew manually.
            </div>
          )}

          <button onClick={handleRenew} className="mt-4 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
            <RotateCw size={14} /> Renew Now
          </button>

          <div className="mt-5 grid grid-cols-1 gap-2 border-t pt-4 sm:grid-cols-2" style={{ borderColor: COLORS.line }}>
            {["Public portfolio URL & branding", "Downloadable verified PDF export", "\u201cVerified\u201d badge on certificates", "Analytics on who viewed your profile"].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: COLORS.ink }}>
                <Check size={12} style={{ color: COLORS.sage }} /> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionHeader title="Billing History" />
        <div className="overflow-hidden rounded-lg" style={{ border: `1px solid ${COLORS.line}` }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ backgroundColor: COLORS.paper }}>
                {["Date", "Description", "Amount", "Status"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((b, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${COLORS.line}`, backgroundColor: COLORS.card }}>
                  <td className="px-4 py-2.5 text-xs" style={{ color: COLORS.ink60 }}>
                    {b.date}
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: COLORS.ink }}>
                    {b.desc}
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }}>
                    {formatIDR(b.amount)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: COLORS.sage, backgroundColor: `${COLORS.sage}14` }}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <SectionHeader title="Your Visibility" sub="How much interest your public competency profile is getting" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="flex-1 rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: COLORS.ink60 }}>
              Profile Views This Month
            </div>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="mt-2 text-2xl font-semibold">
              {PROFILE_VIEWS.thisMonth}
            </div>
            <div className="mt-0.5 text-xs" style={{ color: COLORS.ink60 }}>
              vs {PROFILE_VIEWS.lastMonth} last month
            </div>
          </div>
          <div className="flex-1 rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: COLORS.ink60 }}>
              Via Public Link
            </div>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="mt-2 text-2xl font-semibold">
              {PROFILE_VIEWS.publicLinkViews}
            </div>
            <div className="mt-0.5 text-xs" style={{ color: COLORS.ink60 }}>
              People who opened your shared link
            </div>
          </div>
          <div className="flex-1 rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: COLORS.ink60 }}>
              Found via Employer Search
            </div>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="mt-2 text-2xl font-semibold">
              {PROFILE_VIEWS.searchAppearances}
            </div>
            <div className="mt-0.5 text-xs" style={{ color: COLORS.ink60 }}>
              Appeared in Talent Search results
            </div>
          </div>
          <div className="flex-1 rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: COLORS.ink60 }}>
              Active Certificates
            </div>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="mt-2 text-2xl font-semibold">
              {certificates.filter((c) => c.status === "active").length}/{certificates.length}
            </div>
            <div className="mt-0.5 text-xs" style={{ color: COLORS.ink60 }}>
              {requests.filter((r) => r.status === "pending").length} verifier request(s) awaiting your response
            </div>
          </div>
        </div>
        {!isPremium && (
          <p className="mt-2 text-xs" style={{ color: COLORS.ink60 }}>
            Upgrade to Premium to see <em>which</em> companies viewed your public profile, not just the count.
          </p>
        )}
      </div>

      <div>
        <SectionHeader title="Public Portfolio & Sharing" sub="Control what employers and other verifiers can see" />
        <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Link2 size={14} style={{ color: COLORS.ink60 }} className="shrink-0" />
              <span className="truncate text-sm" style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }}>
                {portfolioUrl}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium"
                style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
              >
                <Copy size={12} /> {copied ? "Copied" : "Copy"}
              </button>
              <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
                <QrCode size={12} /> QR Code
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-lg p-3" style={{ backgroundColor: COLORS.paper }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: COLORS.ink }}>
              {portfolioPublic ? <Eye size={13} style={{ color: COLORS.sage }} /> : <EyeOff size={13} style={{ color: COLORS.ink60 }} />}
              {portfolioPublic ? "Portfolio is public — anyone with the link can view your summary" : "Portfolio is private — link is disabled"}
            </div>
            <button
              onClick={() => setPortfolioPublic((p) => !p)}
              className="relative h-5 w-9 rounded-full transition-colors"
              style={{ backgroundColor: portfolioPublic ? COLORS.primary : COLORS.line }}
            >
              <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all" style={{ left: portfolioPublic ? 18 : 2 }} />
            </button>
          </div>

          {!isPremium && (
            <div className="mt-3 flex items-center gap-2 rounded-lg p-3 text-xs" style={{ backgroundColor: `${COLORS.violet}0F`, border: `1px solid ${COLORS.violet}30`, color: COLORS.ink }}>
              <Sparkles size={13} style={{ color: COLORS.violet }} /> Upgrade to Premium for a custom URL, verified PDF export, and view analytics.
            </div>
          )}

          {portfolioPublic && (
            <div className="mt-4">
              <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
                How much can employers see?
              </div>
              <div className="mt-2 space-y-2">
                {[
                  {
                    key: "full",
                    label: "Full Access",
                    desc: "Employers see your complete report instantly — exam scores, CPD history, transcript. No approval needed per request.",
                  },
                  {
                    key: "partial",
                    label: "Partial — Public Summary Only",
                    desc: "Employers only ever see your name, certifications, and status badges. Full reports are never available, even if requested.",
                  },
                  {
                    key: "request",
                    label: "Request-Based Consent",
                    desc: "Employers see the public summary, and must send a request for anything more — you approve or deny each one yourself.",
                  },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setConsentLevel(opt.key)}
                    className="flex w-full items-start gap-3 rounded-lg p-3 text-left"
                    style={{
                      backgroundColor: consentLevel === opt.key ? `${COLORS.primary}0C` : COLORS.paper,
                      border: `1px solid ${consentLevel === opt.key ? COLORS.primary : COLORS.line}`,
                    }}
                  >
                    <div
                      className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                      style={{ border: `1.5px solid ${consentLevel === opt.key ? COLORS.primary : COLORS.line}` }}
                    >
                      {consentLevel === opt.key && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.primary }} />}
                    </div>
                    <div>
                      <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
                        {opt.label}
                      </div>
                      <div className="mt-0.5 text-[11px]" style={{ color: COLORS.ink60 }}>
                        {opt.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
              Certificates shown on your public portfolio
            </div>
            <div className="mt-2 space-y-1.5">
              {certificates.map((c) => (
                <label key={c.id} className="flex items-center justify-between rounded-md px-3 py-2" style={{ backgroundColor: COLORS.paper }}>
                  <span className="text-xs" style={{ color: COLORS.ink }}>
                    {c.name}
                  </span>
                  <button onClick={() => toggleCertVisibility(c.id)} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: certVisibility[c.id] ? COLORS.sage : COLORS.ink60 }}>
                    {certVisibility[c.id] ? <Eye size={13} /> : <EyeOff size={13} />}
                    {certVisibility[c.id] ? "Visible" : "Hidden"}
                  </button>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader title="Verifier Requests" sub="Companies asking to see your full verification report" />
        {consentLevel === "partial" ? (
          <div className="rounded-lg p-4 text-sm" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink60 }}>
            Your access level is set to <strong style={{ color: COLORS.ink }}>Partial</strong> — employers can only see your public summary, so no full-report requests can come in. Switch to Full Access or Request-Based Consent above to change this.
          </div>
        ) : consentLevel === "full" ? (
          <div className="mb-3 flex items-center gap-2 rounded-lg p-3 text-xs" style={{ backgroundColor: `${COLORS.cyan}12`, border: `1px solid ${COLORS.cyan}35`, color: COLORS.ink }}>
            <Info size={13} style={{ color: COLORS.cyan }} /> Your access level is set to <strong>Full Access</strong> — requests below were approved automatically. You can still review them, or switch to Request-Based Consent to approve future ones yourself.
          </div>
        ) : null}
        {consentLevel !== "partial" && (
        <div className="space-y-2">
          {requests.map((r) => (
            <div key={r.id} className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building2 size={14} style={{ color: COLORS.ink60 }} />
                  <span className="text-sm font-medium" style={{ color: COLORS.ink }}>
                    {r.company}
                  </span>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    color: r.status === "approved" ? COLORS.sage : r.status === "denied" ? COLORS.crimson || COLORS.amber : COLORS.amber,
                    backgroundColor: r.status === "approved" ? `${COLORS.sage}14` : `${COLORS.amber}14`,
                  }}
                >
                  {r.status === "pending" ? "Awaiting Your Response" : r.status === "approved" ? "Approved" : "Denied"}
                </span>
              </div>
              <div className="mt-1 text-xs" style={{ color: COLORS.ink60 }}>
                {r.reason} · Requested {r.requestedAt}
              </div>
              {r.status === "pending" && consentLevel === "request" && (
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => respondRequest(r.id, "approved")} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: COLORS.sage }}>
                    <Check size={12} /> Approve
                  </button>
                  <button onClick={() => respondRequest(r.id, "denied")} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
                    <X size={12} /> Deny
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}

/* ---------- My Profile (v3, 2026-08-24) ----------
   Position is a dropdown from master data (positions-master-data.js), never
   free text. The selected position's hrFamily flag feeds the Verify Talent
   upsell targeting evaluated server-side via GET /me. */
function ProfileTab() {
  const [profile, setProfile] = useState({
    fullName: "Dinda Pramesti",
    email: "dinda.pramesti@gmail.com",
    positionId: "freelance-hr-competency-consultant",
    location: "DKI Jakarta",
    yearsExperience: 8,
  });
  const [saved, setSaved] = useState(false);
  const active = POSITIONS.filter((p) => p.active);
  const selected = POSITIONS.find((p) => p.id === profile.positionId);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    // real impl: PATCH /me { position_id } — server re-evaluates upsells[]
  };

  return (
    <div className="max-w-xl">
      <h1 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-2xl font-semibold">
        My Profile
      </h1>
      <p className="mt-1 text-sm" style={{ color: COLORS.ink60 }}>
        Your position comes from a managed list — pick the closest match. Missing one? Ask DeAcademy support to add it.
      </p>

      <div className="mt-5 rounded-xl p-5" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <label className="block text-xs font-medium" style={{ color: COLORS.ink }}>Full Name</label>
        <input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />

        <label className="mt-4 block text-xs font-medium" style={{ color: COLORS.ink }}>Email</label>
        <input value={profile.email} disabled className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}`, color: COLORS.ink60 }} />

        <label className="mt-4 block text-xs font-medium" style={{ color: COLORS.ink }}>Position</label>
        <select value={profile.positionId} onChange={(e) => setProfile({ ...profile, positionId: e.target.value })} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
          {POSITION_CATEGORIES.map((cat) => {
            const opts = active.filter((p) => p.category === cat);
            return opts.length ? (
              <optgroup key={cat} label={cat}>
                {opts.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </optgroup>
            ) : null;
          })}
        </select>
        {selected && isHrFamily(selected.id) && (
          <p className="mt-1.5 flex items-center gap-1 text-[11px]" style={{ color: COLORS.ink60 }}>
            <Info size={12} /> HR-family position — you may see talent-verification features offered to you.
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium" style={{ color: COLORS.ink }}>Location</label>
            <input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
          </div>
          <div>
            <label className="block text-xs font-medium" style={{ color: COLORS.ink }}>Years of Experience</label>
            <input type="number" min="0" value={profile.yearsExperience} onChange={(e) => setProfile({ ...profile, yearsExperience: Number(e.target.value) })} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
          </div>
        </div>

        <button onClick={save} className="mt-5 flex items-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
          <Check size={15} /> {saved ? "Saved" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

const NAV = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutGrid },
  { key: "profile", label: "My Profile", Icon: User },
  { key: "trainings", label: "My Trainings", Icon: BookOpen },
  { key: "certificates", label: "Certificates", Icon: Award },
  { key: "cpd", label: "CPD / CPE", Icon: ClipboardCheck },
  { key: "membership", label: "Membership", Icon: Crown },
];

export default function LspParticipantDashboard() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="flex min-h-screen w-full" style={{ backgroundColor: COLORS.paper, fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
      `}</style>

      <aside className="hidden w-56 shrink-0 flex-col justify-between p-5 sm:flex" style={{ backgroundColor: COLORS.primaryDeep }}>
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
            <User size={14} color="#fff" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-medium text-white">Dinda Pramesti</div>
            <div className="truncate text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>
              Individual Participant
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 px-5 py-6 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs" style={{ color: COLORS.ink60 }}>
              Welcome back,
            </div>
            <div style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-lg font-semibold">
              Dinda Pramesti
            </div>
          </div>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <Bell size={15} style={{ color: COLORS.ink }} />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-semibold text-white" style={{ backgroundColor: COLORS.primary }}>
              {reminders.length}
            </span>
          </button>
        </div>

        {tab === "dashboard" && <DashboardTab />}
        {tab === "profile" && <ProfileTab />}
        {tab === "trainings" && <TrainingsTab />}
        {tab === "certificates" && <CertificatesTab />}
        {tab === "cpd" && <CpdTab />}
        {tab === "membership" && <MembershipTab />}
      </main>
    </div>
  );
}

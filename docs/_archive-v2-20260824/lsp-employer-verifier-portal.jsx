import React, { useState, useMemo } from "react";
import {
  LayoutGrid,
  Search,
  ClipboardCheck,
  CreditCard,
  Bell,
  ChevronRight,
  Building2,
  Award,
  BadgeCheck,
  MapPin,
  Bookmark,
  BookmarkCheck,
  Clock,
  Check,
  X,
  FileText,
  Sparkles,
  Filter,
  Briefcase,
  Eye,
  TrendingUp,
  Users2,
  Download,
  ShieldCheck,
  ArrowLeft,
  ScrollText,
  GraduationCap,
  AlertTriangle,
  FileDown,
  FileCheck,
} from "lucide-react";

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

const COMPANY = {
  name: "PT Cakra Teknologi Indonesia",
  plan: "Verifier Pro",
  price: 500000,
  billingCycle: "Monthly",
  renewalDate: "Aug 5, 2026",
  requestsThisMonth: 7,
  planLimit: "Unlimited",
};

const CERTIFICATION_OPTIONS = [
  "Competency Assessor Certificate",
  "ISO 9001:2015 Quality Management",
  "Internal Audit Fundamentals",
  "Certified Project Management Associate",
];

// What this employer has searched for, and whether DeAcademy's talent pool had a match
const SEARCH_HISTORY = [
  { competency: "Competency Assessor Certificate", searches: 8, avgResults: 5, matched: true },
  { competency: "ISO 9001:2015 Quality Management", searches: 5, avgResults: 3, matched: true },
  { competency: "Internal Audit Fundamentals", searches: 6, avgResults: 4, matched: true },
  { competency: "Six Sigma Black Belt", searches: 4, avgResults: 0, matched: false },
  { competency: "Certified Data Protection Officer", searches: 3, avgResults: 0, matched: false },
];
const totalSearches = SEARCH_HISTORY.reduce((a, s) => a + s.searches, 0);
const matchedSearches = SEARCH_HISTORY.filter((s) => s.matched).reduce((a, s) => a + s.searches, 0);
const matchRatePct = Math.round((matchedSearches / totalSearches) * 100);
const skillGaps = SEARCH_HISTORY.filter((s) => !s.matched).sort((a, b) => b.searches - a.searches);
const REGION_OPTIONS = ["DKI Jakarta", "Jawa Barat", "Jawa Timur", "Sumatera Utara"];
const EXPERIENCE_OPTIONS = ["Entry-level (0–2 yrs)", "Mid-level (3–5 yrs)", "Senior (6+ yrs)"];

function experienceBucket(years) {
  if (years <= 2) return "Entry-level (0–2 yrs)";
  if (years <= 5) return "Mid-level (3–5 yrs)";
  return "Senior (6+ yrs)";
}

// Only participants who opted their portfolio into the public directory appear here.
const CANDIDATES = [
  {
    id: 1,
    name: "Dinda Pramesti",
    headline: "Certified Competency Assessor · Quality & Compliance Professional",
    region: "DKI Jakarta",
    yearsExperience: 6,
    certifications: ["Competency Assessor Certificate", "H&S Regulation Awareness Certificate", "Certified Project Management Associate"],
    availability: "Open to opportunities",
  },
  {
    id: 2,
    name: "Rahmat Hidayat",
    headline: "ISO 9001 Lead Auditor",
    region: "Jawa Barat",
    yearsExperience: 9,
    certifications: ["ISO 9001:2015 Quality Management"],
    availability: "Employed",
  },
  {
    id: 3,
    name: "Maya Kusuma",
    headline: "Internal Audit & Risk Specialist",
    region: "Jawa Timur",
    yearsExperience: 2,
    certifications: ["Internal Audit Fundamentals", "Certified Project Management Associate"],
    availability: "Open to opportunities",
  },
  {
    id: 4,
    name: "Sri Wulandari",
    headline: "Quality Assurance Lead",
    region: "DKI Jakarta",
    yearsExperience: 4,
    certifications: ["ISO 9001:2015 Quality Management", "Internal Audit Fundamentals"],
    availability: "Open to opportunities",
  },
];

const MY_REQUESTS = [
  { id: 1, candidate: "Dinda Pramesti", sentAt: "Jul 18, 2026", status: "pending", note: "Awaiting her approval" },
  { id: 2, candidate: "Sri Wulandari", sentAt: "Jul 5, 2026", status: "approved", note: "Full report available" },
  { id: 3, candidate: "Budi Santoso", sentAt: "Jun 28, 2026", status: "denied", note: "Request declined" },
];

const VIEWS_MONTHLY = [
  { month: "Feb", views: 38 },
  { month: "Mar", views: 45 },
  { month: "Apr", views: 52 },
  { month: "May", views: 60 },
  { month: "Jun", views: 71 },
  { month: "Jul", views: 84 },
];
const VIEWS_YOY = { thisYear: 412, lastYear: 298 };
const viewsGrowthPct = Math.round(((VIEWS_YOY.thisYear - VIEWS_YOY.lastYear) / VIEWS_YOY.lastYear) * 100);

function MiniBarChart({ data, valueKey, labelKey }) {
  const max = Math.max(...data.map((d) => d[valueKey]));
  return (
    <div className="flex items-end gap-2" style={{ height: 90 }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="w-full rounded-t-sm" style={{ height: `${(d[valueKey] / max) * 70}px`, backgroundColor: COLORS.primary, opacity: i === data.length - 1 ? 1 : 0.55 }} />
          <span className="text-[9px]" style={{ color: COLORS.ink60 }}>
            {d[labelKey]}
          </span>
        </div>
      ))}
    </div>
  );
}

const INVOICES = [
  { date: "Jul 5, 2026", desc: "Verifier Pro — Monthly", amount: 500000, status: "Paid" },
  { date: "Jun 5, 2026", desc: "Verifier Pro — Monthly", amount: 500000, status: "Paid" },
  { date: "May 5, 2026", desc: "Verifier Pro — Monthly", amount: 500000, status: "Paid" },
];

function formatIDR(v) {
  return "Rp " + v.toLocaleString("id-ID");
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

// ---------------- Dashboard ----------------
function DashboardTab() {
  return (
    <div className="space-y-8">
      <div>
        <SectionHeader title="Talent Profile Views" sub="How much visibility you're getting into DeAcademy's verified talent pool" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile Icon={Eye} accent={COLORS.primary} eyebrow="Views This Month" value={VIEWS_MONTHLY[VIEWS_MONTHLY.length - 1].views} sub={`vs ${VIEWS_MONTHLY[VIEWS_MONTHLY.length - 2].views} last month`} />
          <StatTile Icon={Users2} accent={COLORS.cyan} eyebrow="Views This Year" value={VIEWS_YOY.thisYear} sub={`vs ${VIEWS_YOY.lastYear} same period last year`} />
          <StatTile Icon={TrendingUp} accent={COLORS.sage} eyebrow="YoY Growth" value={`+${viewsGrowthPct}%`} sub="Year-over-year view growth" />
          <StatTile Icon={CreditCard} accent={COLORS.violet} eyebrow="Plan" value={COMPANY.plan} sub={`Renews ${COMPANY.renewalDate}`} />
        </div>
        <div className="mt-3 rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <div className="mb-2 text-xs font-medium" style={{ color: COLORS.ink }}>
            Monthly Views Trend
          </div>
          <MiniBarChart data={VIEWS_MONTHLY} valueKey="views" labelKey="month" />
        </div>
      </div>

      <div>
        <SectionHeader title="Consent Requests" sub="Talent whose full report you've requested — approval is always up to them" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile Icon={ClipboardCheck} accent={COLORS.primary} eyebrow="Requests This Month" value={COMPANY.requestsThisMonth} sub={`Plan limit: ${COMPANY.planLimit}`} />
          <StatTile Icon={Check} accent={COLORS.sage} eyebrow="Consent Approved" value={MY_REQUESTS.filter((r) => r.status === "approved").length} sub="Full reports unlocked" />
          <StatTile Icon={Clock} accent={COLORS.amber} eyebrow="Awaiting Consent" value={MY_REQUESTS.filter((r) => r.status === "pending").length} sub="Not yet approved or denied" />
          <StatTile Icon={X} accent={COLORS.crimson} eyebrow="Denied" value={MY_REQUESTS.filter((r) => r.status === "denied").length} sub="Candidate declined access" />
        </div>
      </div>

      <div>
        <SectionHeader title="Search Match Rate & Skill Gaps" sub="How often your searches find a qualified match — and where the talent pool is thin" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile Icon={Check} accent={COLORS.sage} eyebrow="Search Match Rate" value={`${matchRatePct}%`} sub={`${matchedSearches} of ${totalSearches} searches found candidates`} />
          <StatTile Icon={X} accent={COLORS.crimson} eyebrow="Searches With No Match" value={totalSearches - matchedSearches} sub="This period" />
          <StatTile Icon={AlertTriangle} accent={COLORS.amber} eyebrow="Top Skill Gap" value={skillGaps[0]?.competency ?? "None"} sub={`${skillGaps[0]?.searches ?? 0} searches, 0 results`} />
          <StatTile Icon={Users2} accent={COLORS.violet} eyebrow="Competencies Searched" value={SEARCH_HISTORY.length} sub="Distinct competencies this period" />
        </div>

        {skillGaps.length > 0 && (
          <div className="mt-3 rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="mb-2 text-xs font-medium" style={{ color: COLORS.ink }}>
              Competencies You Searched For, With No Match in DeAcademy's Pool
            </div>
            <div className="space-y-2">
              {skillGaps.map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-md p-2.5" style={{ backgroundColor: COLORS.paper }}>
                  <div>
                    <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
                      {s.competency}
                    </div>
                    <div className="text-[11px]" style={{ color: COLORS.ink60 }}>
                      Searched {s.searches} times, 0 verified candidates found
                    </div>
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: COLORS.amber, backgroundColor: `${COLORS.amber}14` }}>
                    Not yet in DeAcademy catalog
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px]" style={{ color: COLORS.ink60 }}>
              This is shared anonymously with DeAcademy's training team to help prioritize new certification programs
              — your search details stay private.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg p-4 text-xs" style={{ backgroundColor: `${COLORS.primary}0A`, border: `1px solid ${COLORS.primary}30`, color: COLORS.ink }}>
        Every verification request is sent directly to the candidate for their approval — DeAcademy never shares a
        full competency report without the candidate's consent, in line with Indonesia's Personal Data Protection Law
        (UU PDP).
      </div>

      <div>
        <SectionHeader title="Recent Requests" />
        <div className="space-y-2">
          {MY_REQUESTS.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg p-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div>
                <div className="text-sm font-medium" style={{ color: COLORS.ink }}>
                  {r.candidate}
                </div>
                <div className="text-xs" style={{ color: COLORS.ink60 }}>
                  Sent {r.sentAt} · {r.note}
                </div>
              </div>
              <Pill color={r.status === "approved" ? COLORS.sage : r.status === "denied" ? COLORS.crimson : COLORS.amber}>
                {r.status === "approved" ? "Approved" : r.status === "denied" ? "Denied" : "Pending"}
              </Pill>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- Talent Search ----------------
function CandidateDetail({ candidate, onClose, requestState, onRequest, onViewReport }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end" style={{ backgroundColor: "rgba(16,27,51,0.45)" }}>
      <div className="h-full w-full max-w-md overflow-y-auto p-6" style={{ backgroundColor: COLORS.paper }}>
        <div className="flex items-center justify-between">
          <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-xl font-semibold">
            {candidate.name}
          </h2>
          <button onClick={onClose}>
            <X size={18} style={{ color: COLORS.ink60 }} />
          </button>
        </div>
        <p className="mt-1 text-sm" style={{ color: COLORS.ink60 }}>
          {candidate.headline}
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: COLORS.ink60 }}>
          <MapPin size={12} /> {candidate.region} · {candidate.availability}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: COLORS.ink60 }}>
          <Briefcase size={12} /> {candidate.yearsExperience} years of experience · {experienceBucket(candidate.yearsExperience)}
        </div>

        <div className="mt-5">
          <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
            Verified Certificates (public)
          </div>
          <div className="mt-2 space-y-2">
            {candidate.certifications.map((c, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg p-2.5" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <Award size={14} style={{ color: COLORS.primary }} />
                <span className="flex-1 text-xs" style={{ color: COLORS.ink }}>
                  {c}
                </span>
                <BadgeCheck size={13} style={{ color: COLORS.sage }} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: COLORS.ink }}>
            <FileText size={13} /> Full Verification Report
          </div>
          <p className="mt-1 text-xs" style={{ color: COLORS.ink60 }}>
            Exam scores, full CPD history, complete training transcript, and examiner endorsement notes.
          </p>

          {requestState === "approved" ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: COLORS.sage }}>
                <Check size={13} /> Approved — report unlocked
              </div>
              <button onClick={() => onViewReport(candidate)} className="flex w-full items-center justify-center gap-2 rounded-md py-2 text-xs font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
                <FileText size={13} /> View Full Report
              </button>
            </div>
          ) : requestState === "pending" ? (
            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium" style={{ color: COLORS.amber }}>
              <Clock size={13} /> Request sent — awaiting candidate approval
            </div>
          ) : (
            <button onClick={() => onRequest(candidate.id)} className="mt-3 flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
              <Sparkles size={12} /> Request Full Report — Included in {COMPANY.plan}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const FULL_REPORT_DATA = {
  4: {
    generatedAt: "Jul 22, 2026",
    verificationCode: "DAC-VR-2026-88214",
    summary: { totalCerts: 2, totalTrainings: 3, yearsCertified: 1 },
    certificates: [
      { name: "ISO 9001:2015 Quality Management Certificate", issuer: "DeAcademy", issued: "Mar 18, 2026", status: "Active", requiresCpd: true, cpdNote: "18/24 hrs logged this cycle" },
      { name: "Internal Audit Fundamentals Certificate", issuer: "DeAcademy", issued: "Feb 20, 2026", status: "Active", requiresCpd: true, cpdNote: "On track" },
    ],
    examResults: [
      { training: "ISO 9001:2015 Quality Management", score: "91% — Passed (threshold 80%)", examiner: "Certified Examiner (DeAcademy)", date: "Mar 18, 2026" },
      { training: "Internal Audit Fundamentals", score: "85% — Passed (threshold 80%)", examiner: "Certified Examiner (DeAcademy)", date: "Feb 20, 2026" },
    ],
    cpdHistory: [
      { cycle: "2026 (Year 1 of 3)", category: "Training", hours: 12 },
      { cycle: "2026 (Year 1 of 3)", category: "Webinar", hours: 6 },
    ],
    trainingTranscript: [
      { title: "ISO 9001:2015 Quality Management", completed: "Mar 18, 2026", duration: "22 days" },
      { title: "Internal Audit Fundamentals", completed: "Feb 20, 2026", duration: "15 days" },
      { title: "Effective Communication for Assessors", completed: "Jan 10, 2026", duration: "6 days" },
    ],
    currencyAttestations: [{ competency: "Quality Management Systems", evidence: "Workload letter — current QMS lead auditor role", verifiedBy: "Employer-Verified", date: "Jul 1, 2026" }],
    examinerNote: "Sri demonstrated a thorough, methodical approach to root-cause analysis during her final assessment. Strong candidate for quality leadership roles.",
  },
};

function ReportSection({ icon: Icon, title, children }) {
  return (
    <div className="rounded-lg p-5" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
      <div className="mb-3 flex items-center gap-1.5 text-sm font-medium" style={{ color: COLORS.ink }}>
        <Icon size={14} style={{ color: COLORS.primary }} /> {title}
      </div>
      {children}
    </div>
  );
}

function FullVerificationReport({ candidate, onClose }) {
  const [downloaded, setDownloaded] = useState(false);
  const report = FULL_REPORT_DATA[candidate.id];

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  if (!report) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: "rgba(16,27,51,0.55)" }}>
        <div className="w-full max-w-sm rounded-xl p-6 text-center" style={{ backgroundColor: COLORS.card }}>
          <p className="text-sm" style={{ color: COLORS.ink60 }}>
            No report data available for this candidate yet.
          </p>
          <button onClick={onClose} className="mt-4 rounded-md px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: COLORS.paper }}>
      {/* Sticky top bar — report is viewed in-platform by default */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 sm:px-8" style={{ backgroundColor: COLORS.primaryDeep }}>
        <button onClick={onClose} className="flex items-center gap-1.5 text-xs font-medium text-white">
          <ArrowLeft size={14} /> Back to Search
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium"
          style={{ backgroundColor: downloaded ? COLORS.sage : "rgba(255,255,255,0.12)", color: "#fff" }}
        >
          <Download size={13} /> {downloaded ? "Downloaded" : "Download PDF"}
        </button>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-5 py-8 sm:px-8">
        {/* Header */}
        <div className="rounded-xl p-6" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-xl font-semibold">
                  {candidate.name}
                </h1>
                <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: COLORS.sage, backgroundColor: `${COLORS.sage}14` }}>
                  <ShieldCheck size={11} /> Verified Report
                </span>
              </div>
              <p className="mt-0.5 text-sm" style={{ color: COLORS.ink60 }}>
                {candidate.headline}
              </p>
            </div>
            <div className="text-right text-[11px]" style={{ color: COLORS.ink60 }}>
              <div>Generated {report.generatedAt}</div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace" }}>{report.verificationCode}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg p-3 text-center" style={{ backgroundColor: COLORS.paper }}>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-lg font-semibold">
                {report.summary.totalCerts}
              </div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                Certificates
              </div>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ backgroundColor: COLORS.paper }}>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-lg font-semibold">
                {report.summary.totalTrainings}
              </div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                Trainings Completed
              </div>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ backgroundColor: COLORS.paper }}>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-lg font-semibold">
                {report.summary.yearsCertified}
              </div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                Years Certified
              </div>
            </div>
          </div>
        </div>

        <ReportSection icon={Award} title="Certificates & Status">
          <div className="space-y-2">
            {report.certificates.map((c, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg p-3" style={{ backgroundColor: COLORS.paper }}>
                <div>
                  <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
                    {c.name}
                  </div>
                  <div className="text-[11px]" style={{ color: COLORS.ink60 }}>
                    {c.issuer} · Issued {c.issued} {c.requiresCpd && `· ${c.cpdNote}`}
                  </div>
                </div>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: COLORS.sage, backgroundColor: `${COLORS.sage}14` }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportSection icon={GraduationCap} title="Final Exam Results">
          <div className="space-y-2">
            {report.examResults.map((e, i) => (
              <div key={i} className="rounded-lg p-3" style={{ backgroundColor: COLORS.paper }}>
                <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
                  {e.training}
                </div>
                <div className="mt-1 text-xs" style={{ color: COLORS.ink }}>
                  {e.score}
                </div>
                <div className="mt-1 text-[11px]" style={{ color: COLORS.ink60 }}>
                  Reviewed by {e.examiner} · {e.date}
                </div>
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportSection icon={ClipboardCheck} title="CPD History">
          <div className="space-y-1.5">
            {report.cpdHistory.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span style={{ color: COLORS.ink }}>
                  {c.cycle} · {c.category}
                </span>
                <span style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink60 }}>{c.hours} hrs</span>
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportSection icon={ScrollText} title="Full Training Transcript">
          <div className="space-y-1.5">
            {report.trainingTranscript.map((t, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span style={{ color: COLORS.ink }}>{t.title}</span>
                <span style={{ color: COLORS.ink60 }}>
                  {t.completed} · {t.duration}
                </span>
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportSection icon={Briefcase} title="Competency Currency Attestations">
          {report.currencyAttestations.length === 0 ? (
            <p className="text-xs" style={{ color: COLORS.ink60 }}>
              No non-CPD certificates due for a currency check yet.
            </p>
          ) : (
            <div className="space-y-2">
              {report.currencyAttestations.map((a, i) => (
                <div key={i} className="rounded-lg p-3" style={{ backgroundColor: COLORS.paper }}>
                  <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
                    {a.competency}
                  </div>
                  <div className="mt-1 text-[11px]" style={{ color: COLORS.ink60 }}>
                    {a.evidence} · {a.date}
                  </div>
                  <span className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: COLORS.sage, backgroundColor: `${COLORS.sage}14` }}>
                    {a.verifiedBy}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ReportSection>

        <ReportSection icon={FileText} title="Examiner Endorsement">
          <p className="text-sm italic" style={{ color: COLORS.ink60 }}>
            "{report.examinerNote}"
          </p>
        </ReportSection>

        <p className="text-center text-[11px]" style={{ color: COLORS.ink60 }}>
          Generated with {candidate.name}'s explicit consent on {report.generatedAt}. This report reflects data as of
          the generation date — re-verify for the most current status. Authenticity code {report.verificationCode}{" "}
          can be checked at deacademy.id/verify.
        </p>
      </div>
    </div>
  );
}

function TalentSearchTab() {
  const [query, setQuery] = useState("");
  const [viewingReport, setViewingReport] = useState(null);
  const [cert, setCert] = useState("All");
  const [region, setRegion] = useState("All");
  const [experience, setExperience] = useState("All");
  const [saved, setSaved] = useState([]);
  const [selected, setSelected] = useState(null);
  const [requestStates, setRequestStates] = useState({ 1: "pending", 4: "approved" });

  const filtered = useMemo(() => {
    return CANDIDATES.filter((c) => {
      const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase()) || c.headline.toLowerCase().includes(query.toLowerCase());
      const matchesCert = cert === "All" || c.certifications.includes(cert);
      const matchesRegion = region === "All" || c.region === region;
      const matchesExperience = experience === "All" || experienceBucket(c.yearsExperience) === experience;
      return matchesQuery && matchesCert && matchesRegion && matchesExperience;
    });
  }, [query, cert, region, experience]);

  const toggleSave = (id) => setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const sendRequest = (id) => setRequestStates((prev) => ({ ...prev, [id]: "pending" }));

  return (
    <div>
      <SectionHeader title="Talent Search" sub="Find DeAcademy-verified professionals by competency — only candidates who opted into public search appear here" />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-md px-3 py-2" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <Search size={15} style={{ color: COLORS.ink60 }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or headline…" className="w-full bg-transparent text-sm outline-none" style={{ color: COLORS.ink }} />
        </div>
        <select value={cert} onChange={(e) => setCert(e.target.value)} className="rounded-md px-2.5 py-2 text-xs outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
          <option value="All">Any Certification</option>
          {CERTIFICATION_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="rounded-md px-2.5 py-2 text-xs outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
          <option value="All">Any Region</option>
          {REGION_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select value={experience} onChange={(e) => setExperience(e.target.value)} className="rounded-md px-2.5 py-2 text-xs outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
          <option value="All">Any Experience</option>
          {EXPERIENCE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 flex items-center gap-1.5 text-xs" style={{ color: COLORS.ink60 }}>
        <Filter size={12} /> {filtered.length} verified profiles found
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((c) => (
          <div key={c.id} className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="flex items-start justify-between">
              <div>
                <button onClick={() => setSelected(c)} className="text-left text-sm font-medium" style={{ color: COLORS.ink, fontFamily: "Fraunces, serif" }}>
                  {c.name}
                </button>
                <div className="mt-0.5 text-xs" style={{ color: COLORS.ink60 }}>
                  {c.headline}
                </div>
              </div>
              <button onClick={() => toggleSave(c.id)}>
                {saved.includes(c.id) ? <BookmarkCheck size={16} style={{ color: COLORS.primary }} /> : <Bookmark size={16} style={{ color: COLORS.ink60 }} />}
              </button>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: COLORS.ink60 }}>
              <MapPin size={11} /> {c.region} · {c.availability}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: COLORS.ink60 }}>
              <Briefcase size={11} /> {c.yearsExperience} yrs experience · {experienceBucket(c.yearsExperience)}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {c.certifications.map((cert, i) => (
                <span key={i} className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: COLORS.paper, color: COLORS.ink60 }}>
                  {cert}
                </span>
              ))}
            </div>
            <button onClick={() => setSelected(c)} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
              View Profile <ChevronRight size={12} />
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <CandidateDetail
          candidate={selected}
          onClose={() => setSelected(null)}
          requestState={requestStates[selected.id]}
          onRequest={sendRequest}
          onViewReport={(c) => {
            setViewingReport(c);
            setSelected(null);
          }}
        />
      )}
      {viewingReport && <FullVerificationReport candidate={viewingReport} onClose={() => setViewingReport(null)} />}
    </div>
  );
}

// ---------------- Billing ----------------
function BillingTab() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Billing" sub="Manage your verifier plan and payment history" />

      <div className="rounded-xl p-6" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.primary}40` }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>
              {COMPANY.plan}
            </div>
            <div className="text-xs" style={{ color: COLORS.ink60 }}>
              {formatIDR(COMPANY.price)} / {COMPANY.billingCycle.toLowerCase()} · {COMPANY.planLimit} verification requests
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs" style={{ color: COLORS.ink60 }}>
              Renews on
            </div>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-sm font-semibold">
              {COMPANY.renewalDate}
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="rounded-md px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
            Manage Plan
          </button>
          <button className="rounded-md px-3 py-2 text-xs font-medium" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
            Switch to Pay-per-Request
          </button>
        </div>
      </div>

      <div>
        <SectionHeader title="Invoice History" />
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
              {INVOICES.map((inv, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${COLORS.line}`, backgroundColor: COLORS.card }}>
                  <td className="px-4 py-2.5 text-xs" style={{ color: COLORS.ink60 }}>
                    {inv.date}
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: COLORS.ink }}>
                    {inv.desc}
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }}>
                    {formatIDR(inv.amount)}
                  </td>
                  <td className="px-4 py-2.5">
                    <Pill color={COLORS.sage}>{inv.status}</Pill>
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
  { key: "search", label: "Talent Search", Icon: Search },
  { key: "billing", label: "Billing", Icon: CreditCard },
];

const EMPLOYER_REPORT_SECTIONS = [
  { key: "activity", label: "Talent Search Activity", desc: "Profile views this month and YoY trend" },
  { key: "matchgap", label: "Match Rate & Skill Gaps", desc: "How often searches found a qualified match" },
  { key: "requests", label: "Verification Requests", desc: "Approved, pending, and denied consent requests" },
  { key: "billing", label: "Billing Summary", desc: "Plan usage and invoice history" },
];

function ReportBuilderModal({ onClose }) {
  const [selectedSections, setSelectedSections] = useState(EMPLOYER_REPORT_SECTIONS.map((s) => s.key));
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
          Pick what to include — useful for showing your team the ROI of your DeAcademy verification plan.
        </p>

        <div className="mt-5">
          <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
            Period
          </label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
            {["This Month", "This Quarter", "This Year"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
            Sections to Include
          </label>
          <div className="mt-2 space-y-1.5">
            {EMPLOYER_REPORT_SECTIONS.map((s) => (
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

export default function EmployerVerifierPortal() {
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
              <Briefcase size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: "Fraunces, serif" }} className="text-sm font-semibold text-white">
                {COMPANY.name}
              </div>
              <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                Verifier Account
              </div>
            </div>
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
            <Building2 size={14} color="#fff" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-medium text-white">Kevin Wijaya</div>
            <div className="truncate text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>
              Talent Acquisition Lead
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 px-5 py-6 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs" style={{ color: COLORS.ink60 }}>
              DeAcademy for Employers
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
            </button>
          </div>
        </div>

        {tab === "dashboard" && <DashboardTab />}
        {tab === "search" && <TalentSearchTab />}
        {tab === "billing" && <BillingTab />}
        {showReportBuilder && <ReportBuilderModal onClose={() => setShowReportBuilder(false)} />}
      </main>
    </div>
  );
}

/* ============================================================================
   DeAcademy portal prototype — v3 context note (2026-08-24)

   The current integrated prototype is the unified app (`lsp-unified-app.html`):
   one login, one shell, a workspace switcher across roles (incl. the new
   Super Admin workspace), guest browsing, and attribute-driven upsells.
   This file remains the detailed per-workspace feature reference.

   v3: talent search summary is also reachable by guests from the unified app landing.

   Cross-references: docs/PRD.md §4.9–4.11 & §5a, docs/DATA-MODEL.md §1.1 & §9,
   src/positions-master-data.js (position master data + upsell rules).
   ============================================================================ */
import React, { useState } from "react";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  Building2,
  Mail,
  User,
  Send,
  CreditCard,
  Check,
  Info,
  BadgeCheck,
  FileText,
  ClipboardCheck,
  Sparkles,
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

const PROFILE = {
  name: "Dinda Pramesti",
  headline: "Certified Competency Assessor · Quality & Compliance Professional",
  memberSince: "Feb 2026",
  trainingsCompleted: 4,
  yearsCertified: 1,
  yearsExperience: 6,
};

const PUBLIC_CERTIFICATES = [
  { name: "Competency Assessor Certificate", issuer: "DeAcademy · BNSP-aligned", status: "Active", issued: "Feb 2, 2026" },
  { name: "H&S Regulation Awareness Certificate", issuer: "DeAcademy", status: "Active", issued: "May 12, 2026" },
  { name: "Certified Project Management Associate", issuer: "PMI Indonesia", status: "Active", issued: "Nov 14, 2024" },
];

const FULL_REPORT = {
  examScore: "88% — Passed (threshold 80%)",
  cpdStatus: "24 / 40 hours this cycle — On Track",
  trainingHistory: [
    { title: "Competency Assessor Certification (BNSP)", completed: "Feb 2, 2026", duration: "38 days" },
    { title: "Assessor Code of Ethics", completed: "Feb 2, 2026", duration: "12 days" },
    { title: "H&S Regulation Awareness", completed: "May 12, 2026", duration: "3 days" },
  ],
  examinerNote: "Demonstrated strong command of evidence-sufficiency principles during the final assessment. Recommended without reservation.",
};

function formatIDR(v) {
  return "Rp " + v.toLocaleString("id-ID");
}

function CertRow({ cert }) {
  return (
    <div className="flex items-center justify-between rounded-lg p-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${COLORS.primary}14` }}>
          <Award size={16} style={{ color: COLORS.primary }} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium" style={{ color: COLORS.ink }}>
            {cert.name}
          </div>
          <div className="text-xs" style={{ color: COLORS.ink60 }}>
            {cert.issuer} · Issued {cert.issued}
          </div>
        </div>
      </div>
      <span className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: COLORS.sage, backgroundColor: `${COLORS.sage}14` }}>
        <BadgeCheck size={11} /> {cert.status}
      </span>
    </div>
  );
}

function RequestForm({ onSubmit }) {
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const canSubmit = company.trim() && email.trim();

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
          Your Company
        </label>
        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="PT Example Indonesia" className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
      </div>
      <div>
        <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
          Your Work Email
        </label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
      </div>
      <div>
        <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
          Reason for Request
        </label>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Pre-employment verification" className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
      </div>
      <button onClick={() => onSubmit({ company, email, reason })} disabled={!canSubmit} className="flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium text-white disabled:opacity-40" style={{ backgroundColor: COLORS.primary }}>
        <CreditCard size={14} /> Pay {formatIDR(150000)} & Send Request
      </button>
    </div>
  );
}

export default function PublicVerificationPage() {
  const [stage, setStage] = useState("locked"); // locked | form | pending | approved
  const [autoApprove, setAutoApprove] = useState(true);
  const [requestInfo, setRequestInfo] = useState(null);

  const handleSubmit = (info) => {
    setRequestInfo(info);
    setStage(autoApprove ? "approved" : "pending");
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: COLORS.paper, fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
      `}</style>

      <header className="px-5 py-4 sm:px-8" style={{ backgroundColor: COLORS.primaryDeep }}>
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: COLORS.primary }}>
            <Award size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: "Fraunces, serif" }} className="text-sm font-semibold text-white">
            DeAcademy — Verified Competency Profile
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        {/* Demo toggle — illustrates the participant's own privacy setting, not part of the real UI chrome */}
        <div className="mb-6 flex items-center justify-between rounded-lg p-3 text-xs" style={{ backgroundColor: `${COLORS.violet}0F`, border: `1px dashed ${COLORS.violet}40`, color: COLORS.ink }}>
          <span className="flex items-center gap-1.5">
            <Info size={13} style={{ color: COLORS.violet }} /> Demo only: simulates Dinda's approval setting
          </span>
          <button
            onClick={() => setAutoApprove((a) => !a)}
            className="rounded-md px-2.5 py-1 font-medium"
            style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
          >
            {autoApprove ? "Auto-approve after payment: ON" : "Requires manual approval: ON"}
          </button>
        </div>

        {/* Profile header */}
        <div className="rounded-xl p-6" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${COLORS.primary}14` }}>
              <User size={28} style={{ color: COLORS.primary }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-xl font-semibold">
                  {PROFILE.name}
                </h1>
                <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: COLORS.sage, backgroundColor: `${COLORS.sage}14` }}>
                  <ShieldCheck size={11} /> Verified Profile
                </span>
              </div>
              <p className="mt-0.5 text-sm" style={{ color: COLORS.ink60 }}>
                {PROFILE.headline}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg p-3 text-center" style={{ backgroundColor: COLORS.paper }}>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-lg font-semibold">
                {PROFILE.yearsExperience}+ yrs
              </div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                Work Experience
              </div>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ backgroundColor: COLORS.paper }}>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-lg font-semibold">
                {PUBLIC_CERTIFICATES.length}
              </div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                Certificates Held
              </div>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ backgroundColor: COLORS.paper }}>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-lg font-semibold">
                {PROFILE.trainingsCompleted}
              </div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                Trainings Completed
              </div>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ backgroundColor: COLORS.paper }}>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-lg font-semibold">
                {PROFILE.memberSince}
              </div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                Member Since
              </div>
            </div>
          </div>
        </div>

        {/* Free public section */}
        <div className="mt-6">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-medium" style={{ color: COLORS.ink }}>
            <CheckCircle2 size={14} style={{ color: COLORS.sage }} /> Public — Free to View
          </div>
          <div className="space-y-2">
            {PUBLIC_CERTIFICATES.map((c, i) => (
              <CertRow key={i} cert={c} />
            ))}
          </div>
          <p className="mt-2 text-xs" style={{ color: COLORS.ink60 }}>
            Certificate authenticity above is cryptographically verified by DeAcademy and cannot be edited by the
            holder.
          </p>
        </div>

        {/* Paid full report section */}
        <div className="mt-8">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-medium" style={{ color: COLORS.ink }}>
            <Lock size={14} style={{ color: COLORS.amber }} /> Full Verification Report — Requires Payment & Consent
          </div>

          {stage === "approved" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg p-3 text-xs" style={{ backgroundColor: `${COLORS.sage}12`, border: `1px solid ${COLORS.sage}35`, color: COLORS.ink }}>
                <Check size={14} style={{ color: COLORS.sage }} /> Access approved
                {autoApprove ? " automatically after payment." : ` by ${PROFILE.name}.`}
              </div>
              <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: COLORS.ink }}>
                  <FileText size={13} /> Final Exam Result
                </div>
                <p className="mt-1 text-sm" style={{ color: COLORS.ink }}>
                  {FULL_REPORT.examScore}
                </p>
              </div>
              <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: COLORS.ink }}>
                  <ClipboardCheck size={13} /> CPD Compliance
                </div>
                <p className="mt-1 text-sm" style={{ color: COLORS.ink }}>
                  {FULL_REPORT.cpdStatus}
                </p>
              </div>
              <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
                  Full Training History
                </div>
                <div className="mt-2 space-y-1.5">
                  {FULL_REPORT.trainingHistory.map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span style={{ color: COLORS.ink }}>{t.title}</span>
                      <span style={{ color: COLORS.ink60 }}>
                        {t.completed} · {t.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
                  Examiner Note
                </div>
                <p className="mt-1 text-sm italic" style={{ color: COLORS.ink60 }}>
                  "{FULL_REPORT.examinerNote}"
                </p>
              </div>
            </div>
          ) : stage === "pending" ? (
            <div className="flex items-center gap-3 rounded-lg p-4" style={{ backgroundColor: `${COLORS.amber}12`, border: `1px solid ${COLORS.amber}35` }}>
              <Clock size={18} style={{ color: COLORS.amber }} />
              <div>
                <div className="text-sm font-medium" style={{ color: COLORS.ink }}>
                  Payment received — awaiting {PROFILE.name}'s approval
                </div>
                <div className="text-xs" style={{ color: COLORS.ink60 }}>
                  She's been notified of your request. You'll get an email at {requestInfo?.email} once she responds — refunded automatically if declined.
                </div>
              </div>
            </div>
          ) : stage === "form" ? (
            <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <RequestForm onSubmit={handleSubmit} />
            </div>
          ) : (
            <div className="rounded-lg p-6" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="flex flex-wrap gap-2 opacity-40 blur-[1px]">
                <div className="h-16 flex-1 rounded-md" style={{ backgroundColor: COLORS.paper }} />
                <div className="h-16 flex-1 rounded-md" style={{ backgroundColor: COLORS.paper }} />
              </div>
              <p className="mt-4 text-sm" style={{ color: COLORS.ink }}>
                Includes exam score, full CPD history, complete training transcript, and the examiner's endorsement
                note.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: COLORS.ink60 }}>
                <Sparkles size={12} /> {formatIDR(150000)} one-time · or subscribe for unlimited verifications if you hire regularly
              </div>
              <button onClick={() => setStage("form")} className="mt-4 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
                <Mail size={14} /> Request Full Report
              </button>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs" style={{ color: COLORS.ink60 }}>
          Every full-report request notifies {PROFILE.name} — she controls whether her detailed history is shared, in line with Indonesia's Personal Data Protection Law (UU PDP).
        </p>
      </main>
    </div>
  );
}

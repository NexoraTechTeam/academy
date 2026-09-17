/* ============================================================================
   DeAcademy portal prototype — v3 context note (2026-08-24)

   The current integrated prototype is the unified app (`lsp-unified-app.html`):
   one login, one shell, a workspace switcher across roles (incl. the new
   Super Admin workspace), guest browsing, and attribute-driven upsells.
   This file remains the detailed per-workspace feature reference.

   v3: no functional changes; Tutor and Examiner remain separate permission sets sharing this one workspace.

   Cross-references: docs/PRD.md §4.9–4.11 & §5a, docs/DATA-MODEL.md §1.1 & §9,
   src/positions-master-data.js (position master data + upsell rules).
   ============================================================================ */
import React, { useState, useMemo } from "react";
import {
  Award,
  ClipboardCheck,
  PenSquare,
  Wrench,
  HelpCircle,
  ShieldCheck,
  FileText,
  FileSpreadsheet,
  Presentation,
  Eye,
  Send,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Clock,
  User,
  Info,
  Star,
  Gauge,
  X,
  Check,
  UserCog,
  Users2,
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

const FILE_TYPE_META = {
  pdf: { Icon: FileText, color: COLORS.crimson, label: "PDF" },
  xlsx: { Icon: FileSpreadsheet, color: COLORS.sage, label: "Excel" },
  docx: { Icon: FileText, color: COLORS.primary, label: "Word" },
  pptx: { Icon: Presentation, color: COLORS.amber, label: "PowerPoint" },
};

// ---------------- Mock data ----------------
const TUTOR_QUEUE = [
  {
    id: "s1",
    type: "exercise",
    participant: "Dinda Pramesti",
    training: "Competency Assessor Certification (BNSP)",
    item: "Exercise: Draft an Assessment Instrument",
    submittedAt: "Jul 14, 2026",
    file: { name: "Assessment-Instrument-Dinda.xlsx", type: "xlsx" },
    status: "pending",
  },
  {
    id: "s2",
    type: "workshop",
    participant: "Budi Santoso",
    training: "Competency Assessor Certification (BNSP)",
    item: "Workshop: Mock Assessment Session",
    submittedAt: "Jul 13, 2026",
    file: { name: "Reflection-Notes-Budi.docx", type: "docx" },
    status: "pending",
  },
  {
    id: "s3",
    type: "exercise",
    participant: "Rahmat Hidayat",
    training: "Internal Audit Fundamentals",
    item: "Exercise: Draft an Audit Checklist",
    submittedAt: "Jul 12, 2026",
    file: { name: "Audit-Checklist-Rahmat.xlsx", type: "xlsx" },
    status: "pending",
  },
  {
    id: "s4",
    type: "exercise",
    participant: "Sri Wulandari",
    training: "Competency Assessor Certification (BNSP)",
    item: "Exercise: Draft an Assessment Instrument",
    submittedAt: "Jul 10, 2026",
    file: { name: "Assessment-Instrument-Sri.xlsx", type: "xlsx" },
    status: "reviewed",
    score: 88,
    feedback: "Solid instrument overall — tighten the evidence criteria wording in section 2 next time.",
  },
];

const QUIZ_RESULTS = [
  { participant: "Dinda Pramesti", quiz: "Knowledge Check: Assessment Basics", score: 90, attempts: 1, status: "passed" },
  { participant: "Budi Santoso", quiz: "Knowledge Check: Instruments", score: 55, attempts: 2, status: "in_progress" },
  { participant: "Rahmat Hidayat", quiz: "Knowledge Check: Assessment Basics", score: 100, attempts: 1, status: "passed" },
  { participant: "Sri Wulandari", quiz: "Knowledge Check: Instruments", score: 78, attempts: 1, status: "passed" },
];

const EXAMINER_QUEUE = [
  {
    id: "e1",
    participant: "Dinda Pramesti",
    exam: "Certification Final Exam",
    training: "Competency Assessor Certification (BNSP)",
    submittedAt: "Jul 14, 2026 · 14:32",
    duration: "18 min 40 sec",
    autoScore: 80,
    status: "pending",
    answers: [
      { q: "The primary purpose of a certification exam is to:", participantAnswer: "Verify competence against a defined standard", correct: true },
      { q: "If evidence of competence is insufficient, the assessor should record the result as:", participantAnswer: "Not Yet Competent", correct: true },
      { q: "A portfolio of evidence typically includes:", participantAnswer: "Work samples, records, and third-party statements", correct: true },
      { q: "Re-assessment should be offered when:", participantAnswer: "Only if the participant complains", correct: false },
      { q: "Assessor decisions should be based primarily on:", participantAnswer: "Sufficient, valid, and current evidence", correct: true },
    ],
  },
  {
    id: "e2",
    participant: "Rahmat Hidayat",
    exam: "Certification Final Exam",
    training: "Competency Assessor Certification (BNSP)",
    submittedAt: "Jul 10, 2026 · 09:12",
    duration: "19 min 55 sec",
    autoScore: 60,
    status: "reviewed",
    decision: "not_yet_competent",
    comment: "Needs a stronger grasp of evidence sufficiency and re-assessment policy. Recommend reviewing Module 3 before the next attempt.",
    answers: [
      { q: "The primary purpose of a certification exam is to:", participantAnswer: "Verify competence against a defined standard", correct: true },
      { q: "If evidence of competence is insufficient, the assessor should record the result as:", participantAnswer: "Excellent", correct: false },
      { q: "A portfolio of evidence typically includes:", participantAnswer: "Work samples, records, and third-party statements", correct: true },
      { q: "Re-assessment should be offered when:", participantAnswer: "Never, regardless of circumstance", correct: false },
      { q: "Assessor decisions should be based primarily on:", participantAnswer: "Sufficient, valid, and current evidence", correct: true },
    ],
  },
  {
    id: "e3",
    participant: "Sri Wulandari",
    exam: "Certification Final Exam",
    training: "Internal Audit Fundamentals",
    submittedAt: "Jul 9, 2026 · 11:05",
    duration: "17 min 10 sec",
    autoScore: 100,
    status: "reviewed",
    decision: "competent",
    comment: "Excellent command of the material across all criteria. Certificate approved.",
    answers: [
      { q: "The primary purpose of a certification exam is to:", participantAnswer: "Verify competence against a defined standard", correct: true },
      { q: "If evidence of competence is insufficient, the assessor should record the result as:", participantAnswer: "Not Yet Competent", correct: true },
      { q: "A portfolio of evidence typically includes:", participantAnswer: "Work samples, records, and third-party statements", correct: true },
      { q: "Re-assessment should be offered when:", participantAnswer: "The result is Not Yet Competent and the process allows it", correct: true },
      { q: "Assessor decisions should be based primarily on:", participantAnswer: "Sufficient, valid, and current evidence", correct: true },
    ],
  },
];

const TYPE_META = {
  exercise: { label: "Exercise", Icon: PenSquare, color: COLORS.cyan },
  workshop: { label: "Workshop", Icon: Wrench, color: COLORS.violet },
};

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

// ---------------- Tutor: grading queue ----------------
function TutorQueueItem({ item, active, onClick }) {
  const meta = TYPE_META[item.type];
  return (
    <button
      onClick={() => onClick(item.id)}
      className="flex w-full items-start gap-2.5 rounded-md px-2.5 py-2.5 text-left"
      style={{ backgroundColor: active ? `${COLORS.primary}12` : "transparent" }}
    >
      <div className="mt-0.5 shrink-0">
        {item.status === "reviewed" ? <CheckCircle2 size={14} style={{ color: COLORS.sage }} /> : <Clock size={14} style={{ color: COLORS.amber }} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <meta.Icon size={11} style={{ color: meta.color }} />
          <span className="text-[10px] uppercase tracking-wide" style={{ color: meta.color }}>
            {meta.label}
          </span>
        </div>
        <div className="mt-0.5 truncate text-xs font-medium" style={{ color: COLORS.ink }}>
          {item.participant}
        </div>
        <div className="truncate text-[11px]" style={{ color: COLORS.ink60 }}>
          {item.item}
        </div>
      </div>
    </button>
  );
}

function SubmissionFileRow({ file }) {
  const [showPreview, setShowPreview] = useState(false);
  const fileMeta = FILE_TYPE_META[file.type];

  return (
    <div>
      <div className="flex items-center justify-between rounded-lg p-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `${fileMeta.color}14` }}>
            <fileMeta.Icon size={15} style={{ color: fileMeta.color }} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-medium" style={{ color: COLORS.ink }}>
              {file.name}
            </div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
              {fileMeta.label}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowPreview((s) => !s)}
          className="flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium"
          style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
        >
          <Eye size={12} /> {showPreview ? "Hide" : "View"}
        </button>
      </div>
      {showPreview && <DocumentPreview file={file} />}
    </div>
  );
}

function DocumentPreview({ file }) {
  if (file.type === "xlsx") {
    const rows = [
      ["Competency Unit", "Performance Criteria", "Evidence Required", "Assessment Method"],
      ["Design assessment instruments", "Instrument aligns to unit standard", "Sample instrument document", "Direct observation"],
      ["Determine evidence sufficiency", "Evidence covers VARF principles", "Portfolio checklist", "Portfolio review"],
    ];
    return (
      <div className="mt-2 overflow-x-auto rounded-lg" style={{ border: `1px solid ${COLORS.line}` }}>
        <table className="w-full text-left text-xs">
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} style={{ backgroundColor: ri === 0 ? COLORS.paper : COLORS.card, borderTop: ri > 0 ? `1px solid ${COLORS.line}` : "none" }}>
                {r.map((c, ci) => (
                  <td key={ci} className="px-3 py-2" style={{ color: COLORS.ink, fontWeight: ri === 0 ? 600 : 400 }}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-3 py-1.5 text-[10px]" style={{ color: COLORS.ink60, backgroundColor: COLORS.paper }}>
          Preview only — showing the first 3 rows of the submitted spreadsheet.
        </div>
      </div>
    );
  }
  if (file.type === "docx") {
    return (
      <div className="mt-2 space-y-2 rounded-lg p-4" style={{ border: `1px solid ${COLORS.line}`, backgroundColor: COLORS.card }}>
        <div className="h-2.5 w-2/3 rounded" style={{ backgroundColor: COLORS.line }} />
        <div className="h-2.5 w-full rounded" style={{ backgroundColor: COLORS.line }} />
        <div className="h-2.5 w-5/6 rounded" style={{ backgroundColor: COLORS.line }} />
        <div className="h-2.5 w-1/2 rounded" style={{ backgroundColor: COLORS.line }} />
        <div className="pt-1 text-[10px]" style={{ color: COLORS.ink60 }}>
          Preview only — document text rendering placeholder.
        </div>
      </div>
    );
  }
  return (
    <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg p-3" style={{ border: `1px solid ${COLORS.line}`, backgroundColor: COLORS.card }}>
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex aspect-video items-center justify-center rounded text-[10px]" style={{ backgroundColor: COLORS.paper, color: COLORS.ink60 }}>
          Slide {n}
        </div>
      ))}
    </div>
  );
}

function GradingDetail({ item, onGrade }) {
  const [score, setScore] = useState(item.score ?? 80);
  const [feedback, setFeedback] = useState(item.feedback ?? "");

  if (item.status === "reviewed") {
    return (
      <div>
        <Header item={item} />
        <div className="mt-4">
          <SubmissionFileRow file={item.file} />
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-lg p-4" style={{ backgroundColor: `${COLORS.sage}12`, border: `1px solid ${COLORS.sage}35` }}>
          <CheckCircle2 size={18} style={{ color: COLORS.sage }} />
          <div>
            <div className="text-sm font-medium" style={{ color: COLORS.ink }}>
              Reviewed — Score: {item.score}/100
            </div>
            <div className="text-xs" style={{ color: COLORS.ink60 }}>
              {item.feedback}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header item={item} />

      <div className="mt-4">
        <SubmissionFileRow file={item.file} />
        <div className="mt-1.5 text-[11px]" style={{ color: COLORS.ink60 }}>
          Submitted {item.submittedAt} · Reviewed in-browser — no download needed.
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-medium" style={{ color: COLORS.ink }}>
          <span className="flex items-center gap-1.5">
            <Gauge size={13} /> Score
          </span>
          <span style={{ fontFamily: "IBM Plex Mono, monospace" }}>{score}/100</span>
        </div>
        <input type="range" min={0} max={100} value={score} onChange={(e) => setScore(Number(e.target.value))} className="mt-2 w-full accent-current" style={{ accentColor: COLORS.primary }} />
      </div>

      <div className="mt-4">
        <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
          Feedback for Participant
        </div>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          placeholder="Add notes the participant will see…"
          className="mt-2 w-full rounded-lg p-3 text-sm outline-none"
          style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => onGrade(item.id, { status: "reviewed", score, feedback })}
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: COLORS.sage }}
        >
          <Check size={14} /> Approve & Score
        </button>
        <button
          onClick={() => onGrade(item.id, { status: "revision", score, feedback })}
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
          style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
        >
          <RotateCcw size={14} /> Request Revision
        </button>
      </div>
    </div>
  );
}

function Header({ item }) {
  const meta = TYPE_META[item.type];
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <meta.Icon size={12} style={{ color: meta.color }} />
        <span className="text-[10px] uppercase tracking-wide" style={{ color: meta.color }}>
          {meta.label}
        </span>
      </div>
      <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="mt-1 text-xl font-semibold">
        {item.item}
      </h2>
      <div className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: COLORS.ink60 }}>
        <User size={12} /> {item.participant} · {item.training}
      </div>
    </div>
  );
}

function QuizResultsTable() {
  return (
    <div className="overflow-hidden rounded-lg" style={{ border: `1px solid ${COLORS.line}` }}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr style={{ backgroundColor: COLORS.paper }}>
            {["Participant", "Quiz", "Score", "Attempts", "Status"].map((h) => (
              <th key={h} className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {QUIZ_RESULTS.map((r, i) => (
            <tr key={i} style={{ borderTop: `1px solid ${COLORS.line}`, backgroundColor: COLORS.card }}>
              <td className="px-4 py-2.5 text-sm font-medium" style={{ color: COLORS.ink }}>
                {r.participant}
              </td>
              <td className="px-4 py-2.5 text-xs" style={{ color: COLORS.ink60 }}>
                {r.quiz}
              </td>
              <td className="px-4 py-2.5 text-xs" style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }}>
                {r.score}%
              </td>
              <td className="px-4 py-2.5 text-xs" style={{ color: COLORS.ink60 }}>
                {r.attempts}
              </td>
              <td className="px-4 py-2.5">
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    color: r.status === "passed" ? COLORS.sage : COLORS.amber,
                    backgroundColor: r.status === "passed" ? `${COLORS.sage}14` : `${COLORS.amber}14`,
                  }}
                >
                  {r.status === "passed" ? "Passed" : "In Progress"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TutorView() {
  const [queue, setQueue] = useState(TUTOR_QUEUE);
  const [selectedId, setSelectedId] = useState(TUTOR_QUEUE.find((q) => q.status === "pending")?.id);
  const [subTab, setSubTab] = useState("queue");

  const pendingCount = queue.filter((q) => q.status === "pending").length;
  const reviewedCount = queue.filter((q) => q.status === "reviewed").length;
  const avgScore = Math.round(queue.filter((q) => q.score).reduce((a, q) => a + q.score, 0) / (queue.filter((q) => q.score).length || 1));

  const selected = queue.find((q) => q.id === selectedId);

  const handleGrade = (id, patch) => {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
    const next = queue.find((q) => q.status === "pending" && q.id !== id);
    if (next) setSelectedId(next.id);
  };

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile Icon={Clock} accent={COLORS.amber} eyebrow="Pending Reviews" value={pendingCount} sub="Exercises & workshops awaiting grading" />
        <StatTile Icon={CheckCircle2} accent={COLORS.sage} eyebrow="Reviewed" value={reviewedCount} sub="Completed this cohort" />
        <StatTile Icon={Star} accent={COLORS.violet} eyebrow="Average Score" value={`${avgScore}/100`} sub="Across graded submissions" />
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSubTab("queue")}
          className="rounded-md px-3 py-1.5 text-xs font-medium"
          style={{ backgroundColor: subTab === "queue" ? COLORS.primary : COLORS.card, color: subTab === "queue" ? "#fff" : COLORS.ink, border: `1px solid ${subTab === "queue" ? COLORS.primary : COLORS.line}` }}
        >
          Grading Queue
        </button>
        <button
          onClick={() => setSubTab("quiz")}
          className="rounded-md px-3 py-1.5 text-xs font-medium"
          style={{ backgroundColor: subTab === "quiz" ? COLORS.primary : COLORS.card, color: subTab === "quiz" ? "#fff" : COLORS.ink, border: `1px solid ${subTab === "quiz" ? COLORS.primary : COLORS.line}` }}
        >
          Quiz Results (auto-graded)
        </button>
      </div>

      {subTab === "quiz" ? (
        <QuizResultsTable />
      ) : (
        <div className="flex gap-5">
          <div className="w-64 shrink-0 space-y-1 rounded-lg p-2" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            {queue.map((item) => (
              <TutorQueueItem key={item.id} item={item} active={selectedId === item.id} onClick={setSelectedId} />
            ))}
          </div>
          <div className="flex-1 rounded-lg p-5" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            {selected ? <GradingDetail item={selected} onGrade={handleGrade} /> : <div className="text-sm" style={{ color: COLORS.ink60 }}>Select a submission to review.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- Examiner: exam review ----------------
function ExamQueueItem({ item, active, onClick }) {
  return (
    <button
      onClick={() => onClick(item.id)}
      className="flex w-full items-start gap-2.5 rounded-md px-2.5 py-2.5 text-left"
      style={{ backgroundColor: active ? `${COLORS.primary}12` : "transparent" }}
    >
      <div className="mt-0.5 shrink-0">
        {item.status === "reviewed" ? <CheckCircle2 size={14} style={{ color: COLORS.sage }} /> : <Clock size={14} style={{ color: COLORS.amber }} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={11} style={{ color: COLORS.crimson }} />
          <span className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.crimson }}>
            Exam
          </span>
        </div>
        <div className="mt-0.5 truncate text-xs font-medium" style={{ color: COLORS.ink }}>
          {item.participant}
        </div>
        <div className="truncate text-[11px]" style={{ color: COLORS.ink60 }}>
          {item.training}
        </div>
      </div>
    </button>
  );
}

function ExamReviewDetail({ item, onDecide }) {
  const [decision, setDecision] = useState(item.decision ?? null);
  const [comment, setComment] = useState(item.comment ?? "");

  const correctCount = item.answers.filter((a) => a.correct).length;

  return (
    <div>
      <div>
        <span className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.crimson }}>
          Certification Exam
        </span>
        <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="mt-1 text-xl font-semibold">
          {item.participant}
        </h2>
        <div className="mt-1 text-xs" style={{ color: COLORS.ink60 }}>
          {item.training} · Submitted {item.submittedAt} · Duration {item.duration}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}` }}>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-lg font-semibold">
            {item.autoScore}%
          </div>
          <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
            Provisional Score
          </div>
        </div>
        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}` }}>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-lg font-semibold">
            {correctCount}/{item.answers.length}
          </div>
          <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
            Correct Answers
          </div>
        </div>
        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}` }}>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-lg font-semibold">
            80%
          </div>
          <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
            Passing Threshold
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-lg p-3 text-xs" style={{ backgroundColor: `${COLORS.primary}0A`, border: `1px solid ${COLORS.primary}30`, color: COLORS.ink }}>
        <Info size={13} style={{ color: COLORS.primary }} className="mt-0.5 shrink-0" />
        The provisional score is auto-calculated from objective questions. Final competency decisions must be
        verified and recorded by a certified examiner before a certificate is issued.
      </div>

      <div className="mt-5 space-y-3">
        {item.answers.map((a, i) => (
          <div key={i} className="rounded-lg p-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="text-sm" style={{ color: COLORS.ink }}>
              {i + 1}. {a.q}
            </div>
            <div
              className="mt-1.5 flex items-center gap-1.5 text-xs"
              style={{ color: a.correct ? COLORS.sage : COLORS.crimson }}
            >
              {a.correct ? <Check size={12} /> : <X size={12} />}
              {a.participantAnswer}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
          Examiner Decision
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => setDecision("competent")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium"
            style={{
              backgroundColor: decision === "competent" ? COLORS.sage : COLORS.paper,
              color: decision === "competent" ? "#fff" : COLORS.ink,
              border: `1px solid ${decision === "competent" ? COLORS.sage : COLORS.line}`,
            }}
          >
            <CheckCircle2 size={13} /> Competent
          </button>
          <button
            onClick={() => setDecision("not_yet_competent")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium"
            style={{
              backgroundColor: decision === "not_yet_competent" ? COLORS.crimson : COLORS.paper,
              color: decision === "not_yet_competent" ? "#fff" : COLORS.ink,
              border: `1px solid ${decision === "not_yet_competent" ? COLORS.crimson : COLORS.line}`,
            }}
          >
            <AlertCircle size={13} /> Not Yet Competent
          </button>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Examiner comments (visible to the participant and kept on file for audit)…"
          className="mt-3 w-full rounded-lg p-3 text-sm outline-none"
          style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
        />

        {item.status === "reviewed" ? (
          <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: COLORS.ink60 }}>
            <CheckCircle2 size={13} style={{ color: COLORS.sage }} /> Decision recorded.
          </div>
        ) : (
          <button
            onClick={() => onDecide(item.id, { status: "reviewed", decision, comment })}
            disabled={!decision}
            className="mt-3 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: COLORS.primaryDeep }}
          >
            <Send size={14} /> Finalize Decision
          </button>
        )}
      </div>
    </div>
  );
}

function ExaminerView() {
  const [queue, setQueue] = useState(EXAMINER_QUEUE);
  const [selectedId, setSelectedId] = useState(EXAMINER_QUEUE.find((q) => q.status === "pending")?.id ?? EXAMINER_QUEUE[0].id);

  const pendingCount = queue.filter((q) => q.status === "pending").length;
  const reviewed = queue.filter((q) => q.status === "reviewed");
  const competentRate = Math.round((reviewed.filter((q) => q.decision === "competent").length / (reviewed.length || 1)) * 100);

  const selected = queue.find((q) => q.id === selectedId);

  const handleDecide = (id, patch) => {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
    const next = queue.find((q) => q.status === "pending" && q.id !== id);
    if (next) setSelectedId(next.id);
  };

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile Icon={Clock} accent={COLORS.amber} eyebrow="Pending Reviews" value={pendingCount} sub="Exams awaiting a final decision" />
        <StatTile Icon={ShieldCheck} accent={COLORS.sage} eyebrow="Competent Rate" value={`${competentRate}%`} sub="Of exams reviewed" />
        <StatTile Icon={Star} accent={COLORS.violet} eyebrow="Reviewed" value={reviewed.length} sub="Decisions finalized" />
      </div>

      <div className="flex gap-5">
        <div className="w-64 shrink-0 space-y-1 rounded-lg p-2" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          {queue.map((item) => (
            <ExamQueueItem key={item.id} item={item} active={selectedId === item.id} onClick={setSelectedId} />
          ))}
        </div>
        <div className="flex-1 rounded-lg p-5" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          {selected ? <ExamReviewDetail item={selected} onDecide={handleDecide} /> : <div className="text-sm" style={{ color: COLORS.ink60 }}>Select an exam to review.</div>}
        </div>
      </div>
    </div>
  );
}

export default function TutorExaminerWorkspace() {
  const [role, setRole] = useState("tutor");

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: COLORS.paper, fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
      `}</style>

      <header className="px-5 py-4 sm:px-8" style={{ backgroundColor: COLORS.primaryDeep }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: COLORS.primary }}>
              <Award size={16} color="#fff" />
            </div>
            <span style={{ fontFamily: "Fraunces, serif" }} className="text-sm font-semibold text-white">
              DeAcademy
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-md p-1" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
            <button
              onClick={() => setRole("tutor")}
              className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium"
              style={{ backgroundColor: role === "tutor" ? "#fff" : "transparent", color: role === "tutor" ? COLORS.primaryDeep : "rgba(255,255,255,0.75)" }}
            >
              <UserCog size={13} /> Tutor
            </button>
            <button
              onClick={() => setRole("examiner")}
              className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium"
              style={{ backgroundColor: role === "examiner" ? "#fff" : "transparent", color: role === "examiner" ? COLORS.primaryDeep : "rgba(255,255,255,0.75)" }}
            >
              <ShieldCheck size={13} /> Examiner
            </button>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 sm:px-8">
        <div className="mb-5 flex items-start gap-2.5 rounded-lg p-3 text-xs" style={{ backgroundColor: `${COLORS.violet}0F`, border: `1px solid ${COLORS.violet}30`, color: COLORS.ink }}>
          <Users2 size={14} style={{ color: COLORS.violet }} className="mt-0.5 shrink-0" />
          <span>
            Tutor and Examiner are separate roles in this LMS — the same person may hold one or both, depending on
            assignment and training type. You're currently assigned as <strong>Tutor</strong> for 3 cohorts and{" "}
            <strong>Examiner</strong> for 1 certification track.
          </span>
        </div>

        <h1 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="mb-1 text-2xl font-semibold">
          {role === "tutor" ? "Tutor Review Workspace" : "Examiner Review Workspace"}
        </h1>
        <p className="mb-6 text-sm" style={{ color: COLORS.ink60 }}>
          {role === "tutor"
            ? "Grade exercises and workshop submissions, and monitor auto-graded quiz results."
            : "Examiners review only the Certification Final Exam — exercises, workshops, and quizzes are graded by the Tutor, not the Examiner."}
        </p>

        {role === "tutor" ? <TutorView /> : <ExaminerView />}
      </main>
    </div>
  );
}

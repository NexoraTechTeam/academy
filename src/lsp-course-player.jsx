/* ============================================================================
   DeAcademy portal prototype — v3 context note (2026-08-24)

   The current integrated prototype is the unified app (`lsp-unified-app.html`):
   one login, one shell, a workspace switcher across roles (incl. the new
   Super Admin workspace), guest browsing, and attribute-driven upsells.
   This file remains the detailed per-workspace feature reference.

   v3: no functional changes.

   Cross-references: docs/PRD.md §4.9–4.11 & §5a, docs/DATA-MODEL.md §1.1 & §9,
   src/positions-master-data.js (position master data + upsell rules).
   ============================================================================ */
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  BookOpen,
  HelpCircle,
  PenSquare,
  Wrench,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Send,
  Upload,
  AlertCircle,
  Timer,
  Award,
  X,
  Check,
  ListChecks,
  FileText,
  FileSpreadsheet,
  Presentation,
  Download,
  Paperclip,
  Play,
  Pause,
  Volume2,
  Info,
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

const COURSE_TITLE = "Competency Assessor Certification (BNSP)";

const MODULES = [
  {
    id: "m1",
    title: "Module 1 · Introduction to Competency-Based Assessment",
    items: [
      { id: "1-1", type: "lesson", contentType: "video", title: "What Is Competency-Based Assessment?", duration: "15 min" },
      { id: "1-2", type: "quiz", title: "Knowledge Check: Assessment Basics" },
    ],
  },
  {
    id: "m2",
    title: "Module 2 · Designing Assessment Instruments",
    items: [
      {
        id: "2-1",
        type: "lesson",
        contentType: "slides",
        title: "Principles of Instrument Design",
        duration: "20 min",
        slides: [
          {
            title: "What Is an Assessment Instrument?",
            bullets: ["Defines exactly how evidence will be collected", "Maps directly to a unit's performance criteria", "Used consistently across all candidates"],
          },
          {
            title: "Key Design Principles (VARF)",
            bullets: ["Validity — measures what it claims to measure", "Reliability — consistent results across assessors", "Fairness — no disadvantage to any candidate", "Flexibility — adapts to different contexts"],
          },
          {
            title: "Common Instrument Types",
            bullets: ["Written knowledge test", "Direct observation checklist", "Portfolio of evidence review", "Structured oral questioning"],
          },
          {
            title: "Common Mistakes to Avoid",
            bullets: ["Vague or unmeasurable criteria", "Instruments that are too long to complete", "Missing evidence requirements per criterion"],
          },
        ],
      },
      {
        id: "2-2",
        type: "exercise",
        title: "Exercise: Draft an Assessment Instrument",
        resources: {
          reference: { name: "Assessment Instrument Design Guidelines.pdf", type: "pdf" },
          template: { name: "Assessment-Instrument-Template.xlsx", type: "xlsx" },
        },
      },
      { id: "2-3", type: "quiz", title: "Knowledge Check: Instruments" },
    ],
  },
  {
    id: "m3",
    title: "Module 3 · Practical Application",
    items: [
      {
        id: "3-1",
        type: "workshop",
        title: "Workshop: Mock Assessment Session",
        resources: {
          reference: { name: "Mock Assessment Case Study.pdf", type: "pdf" },
          template: { name: "Workshop-Reflection-Notes-Template.docx", type: "docx" },
        },
      },
    ],
  },
  {
    id: "m4",
    title: "Final Certification Exam",
    items: [{ id: "4-1", type: "exam", title: "Certification Final Exam" }],
  },
];

const INITIAL_COMPLETED = new Set(["1-1", "1-2", "2-1"]);

const QUIZ_BANK = {
  "1-2": {
    passScore: 70,
    questions: [
      {
        q: "Competency-based assessment primarily measures:",
        options: ["Time spent in training", "Ability to perform to a defined standard", "Attendance record", "Seniority level"],
        correct: 1,
        explanation: "Competency-based assessment evaluates whether a person can perform to a defined, observable standard — not simply time spent or attendance.",
      },
      {
        q: "Which set of principles underpins a defensible assessment?",
        options: ["Speed and cost only", "Validity, Reliability, Fairness, Flexibility", "Popularity of the assessor", "Length of the exam"],
        correct: 1,
        explanation: "The VARF principles — Validity, Reliability, Fairness, Flexibility — underpin a defensible, high-quality assessment.",
      },
      {
        q: "Who typically conducts the final competency assessment?",
        options: ["Any senior employee", "A certified assessor", "The training provider's marketing team", "The participant themselves"],
        correct: 1,
        explanation: "A certified, registered assessor is responsible for conducting and validating the final assessment.",
      },
    ],
  },
  "2-3": {
    passScore: 70,
    questions: [
      {
        q: "An assessment instrument should be designed to be:",
        options: ["As long as possible", "Aligned to the competency unit and performance criteria", "Identical across all occupations", "Written only in technical jargon"],
        correct: 1,
        explanation: "Instruments must map directly to the competency unit and its performance criteria to remain valid.",
      },
      {
        q: "Which evidence type is generally considered strongest?",
        options: ["Self-declaration only", "Direct observation of performance", "Hearsay from a colleague", "A general resume"],
        correct: 1,
        explanation: "Direct observation provides the most reliable, first-hand evidence of competence.",
      },
      {
        q: "A well-designed instrument should include:",
        options: ["Only multiple-choice questions", "Clear instructions and defined evidence requirements", "No time allocation", "Unrelated general-knowledge questions"],
        correct: 1,
        explanation: "Clear instructions and explicit evidence requirements reduce ambiguity for both assessor and participant.",
      },
    ],
  },
};

const EXAM_QUESTIONS = [
  {
    q: "The primary purpose of a certification exam is to:",
    options: ["Rank participants against each other", "Verify competence against a defined standard", "Test memorization speed", "Fulfill an administrative requirement only"],
    correct: 1,
  },
  {
    q: "If evidence of competence is insufficient, the assessor should record the result as:",
    options: ["Competent", "Not Yet Competent", "Excellent", "Not applicable"],
    correct: 1,
  },
  {
    q: "A portfolio of evidence typically includes:",
    options: ["Only the final certificate", "Work samples, records, and third-party statements", "A single interview transcript", "Nothing beyond attendance records"],
    correct: 1,
  },
  {
    q: "Re-assessment should be offered when:",
    options: ["Never, regardless of circumstance", "The result is Not Yet Competent and the process allows it", "Only if the participant complains", "Only for corporate-sponsored participants"],
    correct: 1,
  },
  {
    q: "Assessor decisions should be based primarily on:",
    options: ["Personal opinion of the participant", "Sufficient, valid, and current evidence", "How quickly the exam was completed", "The participant's job title"],
    correct: 1,
  },
];

const TYPE_META = {
  lesson: { label: "Video Lesson", Icon: BookOpen, color: COLORS.primary },
  slides: { label: "Slides", Icon: Presentation, color: COLORS.primary },
  quiz: { label: "Quiz", Icon: HelpCircle, color: COLORS.amber },
  exercise: { label: "Exercise", Icon: PenSquare, color: COLORS.cyan },
  workshop: { label: "Workshop", Icon: Wrench, color: COLORS.violet },
  exam: { label: "Exam", Icon: ShieldCheck, color: COLORS.crimson },
};

function getItemMeta(item) {
  if (item.type === "lesson" && item.contentType === "slides") return TYPE_META.slides;
  return TYPE_META[item.type];
}

function flattenItems() {
  const flat = [];
  MODULES.forEach((m) => m.items.forEach((it) => flat.push({ ...it, moduleTitle: m.title })));
  return flat;
}

const FILE_TYPE_META = {
  pdf: { Icon: FileText, color: COLORS.crimson, label: "PDF" },
  xlsx: { Icon: FileSpreadsheet, color: COLORS.sage, label: "Excel" },
  docx: { Icon: FileText, color: COLORS.primary, label: "Word" },
  pptx: { Icon: Presentation, color: COLORS.amber, label: "PowerPoint" },
};

function ResourceRow({ file, action, actionLabel }) {
  const meta = FILE_TYPE_META[file.type];
  return (
    <div className="flex items-center justify-between rounded-lg p-3" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}` }}>
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `${meta.color}14` }}>
          <meta.Icon size={15} style={{ color: meta.color }} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-xs font-medium" style={{ color: COLORS.ink }}>
            {file.name}
          </div>
          <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
            {meta.label}
          </div>
        </div>
      </div>
      <button onClick={action} className="flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
        <Download size={12} /> {actionLabel}
      </button>
    </div>
  );
}

function TaskResources({ resources }) {
  if (!resources) return null;
  return (
    <div className="mt-4 space-y-2">
      <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
        Reference Material
      </div>
      <ResourceRow file={resources.reference} actionLabel="View PDF" action={() => {}} />
      <div className="mt-3 text-xs font-medium" style={{ color: COLORS.ink }}>
        Working Template
      </div>
      <ResourceRow file={resources.template} actionLabel="Download" action={() => {}} />
      <p className="mt-1 text-xs" style={{ color: COLORS.ink60 }}>
        Read the reference material, complete your work in the downloaded template, then upload your finished file
        below.
      </p>
    </div>
  );
}

function FileUploadBox({ uploadedFile, onSelect, onRemove }) {
  const inputRef = useRef(null);
  return (
    <div className="mt-4">
      <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
        Upload Your Completed File
      </div>
      {uploadedFile ? (
        <div className="mt-2 flex items-center justify-between rounded-lg p-3" style={{ backgroundColor: `${COLORS.sage}12`, border: `1px solid ${COLORS.sage}35` }}>
          <div className="flex items-center gap-2 min-w-0">
            <Paperclip size={14} style={{ color: COLORS.sage }} />
            <span className="truncate text-xs font-medium" style={{ color: COLORS.ink }}>
              {uploadedFile}
            </span>
          </div>
          <button onClick={onRemove}>
            <X size={14} style={{ color: COLORS.ink60 }} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-2 flex w-full flex-col items-center justify-center gap-1.5 rounded-lg py-6 text-xs"
          style={{ border: `1.5px dashed ${COLORS.line}`, color: COLORS.ink60 }}
        >
          <Upload size={16} />
          Click to select your completed .xlsx, .docx, or .pptx file
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onSelect(f.name);
        }}
      />
    </div>
  );
}

function ProgressBar({ value, color }) {
  return (
    <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: COLORS.line }}>
      <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}

function SidebarItem({ item, active, locked, completed, onClick }) {
  const meta = getItemMeta(item);
  return (
    <button
      onClick={() => !locked && onClick(item.id)}
      disabled={locked}
      className="flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left"
      style={{ backgroundColor: active ? `${COLORS.primary}12` : "transparent", opacity: locked ? 0.5 : 1 }}
    >
      <div className="mt-0.5 shrink-0">
        {locked ? <Lock size={14} style={{ color: COLORS.ink60 }} /> : completed ? <CheckCircle2 size={14} style={{ color: COLORS.sage }} /> : <Circle size={14} style={{ color: COLORS.ink60 }} />}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <meta.Icon size={11} style={{ color: meta.color }} />
          <span className="text-[10px] uppercase tracking-wide" style={{ color: meta.color }}>
            {meta.label}
          </span>
        </div>
        <div className="mt-0.5 truncate text-xs font-medium" style={{ color: active ? COLORS.ink : COLORS.ink }}>
          {item.title}
        </div>
      </div>
    </button>
  );
}

function LessonView({ item, completed, onComplete }) {
  return (
    <div>
      <div className="rounded-xl p-6" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: COLORS.ink60 }}>
          <Clock size={12} /> {item.duration}
        </div>
        <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="mt-2 text-xl font-semibold">
          {item.title}
        </h2>
        <div className="mt-4 flex aspect-video items-center justify-center rounded-lg" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}` }}>
          <span className="text-xs" style={{ color: COLORS.ink60 }}>
            Lesson video / reading placeholder
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed" style={{ color: COLORS.ink60 }}>
          This lesson covers the core concepts needed before moving on to the module's assessment activities. Review
          the material, then mark it complete to unlock the next step.
        </p>
        {completed && (
          <p className="mt-3 text-xs" style={{ color: COLORS.ink60 }}>
            You've completed this lesson — feel free to revisit it anytime to refresh your knowledge.
          </p>
        )}
      </div>
      <button
        onClick={onComplete}
        disabled={completed}
        className="mt-4 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        style={{ backgroundColor: completed ? COLORS.sage : COLORS.primary }}
      >
        {completed ? <Check size={14} /> : null}
        {completed ? "Completed" : "Mark as Complete"}
      </button>
    </div>
  );
}

const SLIDE_AUDIO_SECONDS = 18;

function SlideDeckPlayer({ item, completed, onComplete }) {
  const slides = item.slides;
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100, simulates narration playback

  useEffect(() => {
    setProgress(0);
    setPlaying(false);
  }, [current]);

  useEffect(() => {
    if (!playing) return;
    if (progress >= 100) {
      setPlaying(false);
      return;
    }
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 100 / (SLIDE_AUDIO_SECONDS * 5))), 200);
    return () => clearInterval(t);
  }, [playing, progress]);

  const slide = slides[current];
  const isLast = current === slides.length - 1;
  const elapsedSec = Math.round((progress / 100) * SLIDE_AUDIO_SECONDS);

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide" style={{ color: COLORS.amber }}>
          <Presentation size={12} /> Slides with Narration
        </span>
        <span className="text-xs" style={{ color: COLORS.ink60 }}>
          Slide {current + 1} of {slides.length}
        </span>
      </div>
      <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="mt-1 text-xl font-semibold">
        {item.title}
      </h2>

      {/* Slide canvas */}
      <div className="mt-4 overflow-hidden rounded-xl" style={{ border: `1px solid ${COLORS.line}` }}>
        <div className="h-1.5 w-full" style={{ backgroundColor: COLORS.primary }} />
        <div className="flex aspect-video flex-col justify-center p-8" style={{ backgroundColor: COLORS.card }}>
          <h3 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-lg font-semibold sm:text-2xl">
            {slide.title}
          </h3>
          <ul className="mt-4 space-y-2">
            {slide.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm" style={{ color: COLORS.ink60 }}>
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS.primary }} />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Narration audio control */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: COLORS.paper, borderTop: `1px solid ${COLORS.line}` }}>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: COLORS.primary }}
          >
            {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>
          <Volume2 size={13} style={{ color: COLORS.ink60 }} />
          <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: COLORS.line }}>
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: COLORS.primary }} />
          </div>
          <span className="whitespace-nowrap text-[11px]" style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink60 }}>
            0:{String(elapsedSec).padStart(2, "0")} / 0:{SLIDE_AUDIO_SECONDS}
          </span>
        </div>
      </div>

      {/* Slide dots */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="h-1.5 rounded-full transition-all"
            style={{ width: i === current ? 20 : 6, backgroundColor: i === current ? COLORS.primary : COLORS.line }}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium disabled:opacity-40"
          style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
        >
          <ChevronLeft size={13} /> Previous
        </button>

        {!isLast ? (
          <button
            onClick={() => setCurrent((c) => Math.min(slides.length - 1, c + 1))}
            className="flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium text-white"
            style={{ backgroundColor: COLORS.primary }}
          >
            Next <ChevronRight size={13} />
          </button>
        ) : (
          <button
            onClick={onComplete}
            disabled={completed}
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            style={{ backgroundColor: completed ? COLORS.sage : COLORS.primary }}
          >
            {completed ? <Check size={14} /> : null}
            {completed ? "Completed" : "Mark as Complete"}
          </button>
        )}
      </div>
      {completed && (
        <p className="mt-3 text-xs" style={{ color: COLORS.ink60 }}>
          You've completed this lesson — feel free to revisit any slide anytime to refresh your knowledge.
        </p>
      )}
    </div>
  );
}

function QuizView({ item, quiz, completed, onPass }) {
  const [mode, setMode] = useState(completed ? "review" : "live"); // review | live | practice
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [attempt, setAttempt] = useState(1);

  const allAnswered = quiz.questions.every((_, i) => answers[i] !== undefined);
  const score = useMemo(() => {
    if (!submitted) return 0;
    const correctCount = quiz.questions.filter((q, i) => answers[i] === q.correct).length;
    return Math.round((correctCount / quiz.questions.length) * 100);
  }, [submitted, answers, quiz.questions]);
  const passed = score >= quiz.passScore;

  const handleSubmit = () => setSubmitted(true);
  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setAttempt((a) => a + 1);
  };
  const startPractice = () => {
    setMode("practice");
    setAnswers({});
    setSubmitted(false);
  };

  useEffect(() => {
    if (mode === "live" && submitted && passed) onPass(item.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, submitted, passed]);

  if (mode === "review") {
    return (
      <div>
        <span className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.sage }}>
          Quiz · Completed
        </span>
        <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="mt-1 text-xl font-semibold">
          {item.title}
        </h2>
        <div className="mt-4 flex items-center gap-3 rounded-lg p-4" style={{ backgroundColor: `${COLORS.sage}12`, border: `1px solid ${COLORS.sage}40` }}>
          <CheckCircle2 size={18} style={{ color: COLORS.sage }} />
          <div>
            <div className="text-sm font-medium" style={{ color: COLORS.ink }}>
              You've already passed this quiz
            </div>
            <div className="text-xs" style={{ color: COLORS.ink60 }}>
              Your official result is locked in and won't change. You can still review the material or retake it
              purely for practice.
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {quiz.questions.map((q, qi) => (
            <div key={qi} className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="text-sm font-medium" style={{ color: COLORS.ink }}>
                {qi + 1}. {q.q}
              </div>
              <div className="mt-2 rounded-md px-3 py-2 text-sm" style={{ backgroundColor: `${COLORS.sage}14`, color: COLORS.ink }}>
                {q.options[q.correct]}
              </div>
              <div className="mt-2 flex items-start gap-1.5 text-xs" style={{ color: COLORS.ink60 }}>
                <AlertCircle size={12} className="mt-0.5 shrink-0" /> {q.explanation}
              </div>
            </div>
          ))}
        </div>

        <button onClick={startPractice} className="mt-5 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
          <RotateCcw size={14} /> Retake for Practice
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.amber }}>
            Quiz · {mode === "practice" ? "Practice Attempt" : `Attempt ${attempt}`}
          </span>
          <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="mt-1 text-xl font-semibold">
            {item.title}
          </h2>
        </div>
        <span className="text-xs" style={{ color: COLORS.ink60 }}>
          Pass mark: {quiz.passScore}%
        </span>
      </div>

      {mode === "practice" && (
        <div className="mb-4 flex items-center gap-2 rounded-lg p-3 text-xs" style={{ backgroundColor: `${COLORS.primary}0A`, border: `1px solid ${COLORS.primary}30`, color: COLORS.ink }}>
          <Info size={13} style={{ color: COLORS.primary }} /> This is a practice attempt — it won't affect your completed status or certificate.
        </div>
      )}

      {submitted && (
        <div
          className="mb-4 flex items-center gap-3 rounded-lg p-4"
          style={{ backgroundColor: passed ? `${COLORS.sage}12` : `${COLORS.crimson}12`, border: `1px solid ${passed ? COLORS.sage : COLORS.crimson}40` }}
        >
          {passed ? <CheckCircle2 size={18} style={{ color: COLORS.sage }} /> : <AlertCircle size={18} style={{ color: COLORS.crimson }} />}
          <div>
            <div className="text-sm font-medium" style={{ color: COLORS.ink }}>
              {passed ? "Passed" : "Not Yet Passed"} — Score: {score}%
            </div>
            <div className="text-xs" style={{ color: COLORS.ink60 }}>
              {mode === "practice"
                ? "Practice result only — your official completion stays as is."
                : passed
                ? "Great work — the next step is now unlocked."
                : "Review the explanations below, then try again to continue."}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {quiz.questions.map((q, qi) => (
          <div key={qi} className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="text-sm font-medium" style={{ color: COLORS.ink }}>
              {qi + 1}. {q.q}
            </div>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, oi) => {
                const isSelected = answers[qi] === oi;
                const isCorrect = oi === q.correct;
                let style = { border: `1px solid ${COLORS.line}`, color: COLORS.ink, backgroundColor: COLORS.paper };
                if (submitted) {
                  if (isCorrect) style = { border: `1px solid ${COLORS.sage}`, color: COLORS.ink, backgroundColor: `${COLORS.sage}14` };
                  else if (isSelected && !isCorrect) style = { border: `1px solid ${COLORS.crimson}`, color: COLORS.ink, backgroundColor: `${COLORS.crimson}12` };
                } else if (isSelected) {
                  style = { border: `1px solid ${COLORS.primary}`, color: COLORS.ink, backgroundColor: `${COLORS.primary}0F` };
                }
                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm"
                    style={style}
                  >
                    {opt}
                    {submitted && isCorrect && <Check size={14} style={{ color: COLORS.sage }} />}
                    {submitted && isSelected && !isCorrect && <X size={14} style={{ color: COLORS.crimson }} />}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div className="mt-2 flex items-start gap-1.5 text-xs" style={{ color: COLORS.ink60 }}>
                <AlertCircle size={12} className="mt-0.5 shrink-0" /> {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5">
        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Send size={14} /> Submit Answers
          </button>
        )}
        {submitted && !passed && mode === "live" && (
          <button onClick={handleRetry} className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: COLORS.crimson }}>
            <RotateCcw size={14} /> Try Again
          </button>
        )}
        {submitted && mode === "practice" && (
          <div className="flex items-center gap-2">
            <button onClick={handleRetry} className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
              <RotateCcw size={14} /> Retry Practice
            </button>
            <button onClick={() => setMode("review")} className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
              Back to Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ExerciseView({ item, completed, onSubmitDone }) {
  const [note, setNote] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submitted, setSubmitted] = useState(completed);

  return (
    <div>
      <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-xl font-semibold">
        {item.title}
      </h2>
      <p className="mt-2 text-sm" style={{ color: COLORS.ink60 }}>
        This exercise is reviewed by your instructor and doesn't block your progress, but feedback will appear in
        your activity history once graded.
      </p>

      <TaskResources resources={item.resources} />

      {submitted ? (
        <div className="mt-4 rounded-lg p-4" style={{ backgroundColor: `${COLORS.cyan}12`, border: `1px solid ${COLORS.cyan}35` }}>
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: COLORS.ink }}>
            <Clock size={14} style={{ color: COLORS.cyan }} /> Submitted — Pending Instructor Review
          </div>
          <div className="mt-2 flex items-center gap-2 min-w-0">
            <Paperclip size={13} style={{ color: COLORS.ink60 }} />
            <span className="truncate text-xs" style={{ color: COLORS.ink60 }}>
              {uploadedFile}
            </span>
          </div>
          <p className="mt-2 text-xs" style={{ color: COLORS.ink60 }}>
            Uploaded the wrong file? You can replace it anytime before your instructor starts reviewing.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-3 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium"
            style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
          >
            <RotateCcw size={12} /> Replace Submission
          </button>
        </div>
      ) : (
        <>
          <FileUploadBox uploadedFile={uploadedFile} onSelect={setUploadedFile} onRemove={() => setUploadedFile(null)} />

          <div className="mt-4 text-xs font-medium" style={{ color: COLORS.ink }}>
            Notes for Your Instructor (optional)
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Anything you'd like your instructor to know about your submission…"
            className="mt-2 w-full rounded-lg p-3 text-sm outline-none"
            style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
          />

          <div>
            <button
              onClick={() => {
                setSubmitted(true);
                onSubmitDone(item.id);
              }}
              disabled={!uploadedFile}
              className="mt-4 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Send size={14} /> Submit Exercise
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function WorkshopView({ item, completed, onSubmitDone }) {
  const [registered, setRegistered] = useState(completed);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submitted, setSubmitted] = useState(completed);

  return (
    <div>
      <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-xl font-semibold">
        {item.title}
      </h2>
      <div className="mt-3 rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="text-sm font-medium" style={{ color: COLORS.ink }}>
          Live Session · Aug 20, 2026, 09:00–12:00 WIB
        </div>
        <p className="mt-1 text-xs" style={{ color: COLORS.ink60 }}>
          A facilitator-led mock assessment session with breakout practice and peer feedback. Attendance plus your
          completed reflection deliverable are recorded as this activity's completion evidence.
        </p>
      </div>

      {!registered && (
        <button
          onClick={() => setRegistered(true)}
          className="mt-4 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: COLORS.primary }}
        >
          Register & Confirm Attendance
        </button>
      )}

      {registered && (
        <div className="mt-4 flex items-center gap-2 rounded-lg p-3 text-sm" style={{ backgroundColor: `${COLORS.sage}12`, border: `1px solid ${COLORS.sage}35`, color: COLORS.ink }}>
          <CheckCircle2 size={15} style={{ color: COLORS.sage }} /> Registered — attendance confirmed.
        </div>
      )}

      {registered && (
        <>
          <TaskResources resources={item.resources} />

          {submitted ? (
            <div className="mt-4 rounded-lg p-4" style={{ backgroundColor: `${COLORS.cyan}12`, border: `1px solid ${COLORS.cyan}35` }}>
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: COLORS.ink }}>
                <Clock size={14} style={{ color: COLORS.cyan }} /> Reflection Notes Submitted — Pending Review
              </div>
              <div className="mt-2 flex items-center gap-2 min-w-0">
                <Paperclip size={13} style={{ color: COLORS.ink60 }} />
                <span className="truncate text-xs" style={{ color: COLORS.ink60 }}>
                  {uploadedFile}
                </span>
              </div>
              <p className="mt-2 text-xs" style={{ color: COLORS.ink60 }}>
                Uploaded the wrong file? You can replace it anytime before your instructor starts reviewing.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-3 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium"
                style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
              >
                <RotateCcw size={12} /> Replace Submission
              </button>
            </div>
          ) : (
            <>
              <FileUploadBox uploadedFile={uploadedFile} onSelect={setUploadedFile} onRemove={() => setUploadedFile(null)} />
              <button
                onClick={() => {
                  setSubmitted(true);
                  onSubmitDone(item.id);
                }}
                disabled={!uploadedFile}
                className="mt-4 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Send size={14} /> Submit Reflection Notes
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ExamView({ item, locked }) {
  const [stage, setStage] = useState("intro"); // intro | in_progress | submitted
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [seconds, setSeconds] = useState(20 * 60);

  useEffect(() => {
    if (stage !== "in_progress") return;
    if (seconds <= 0) {
      setStage("submitted");
      return;
    }
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [stage, seconds]);

  if (locked) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl p-10 text-center" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <Lock size={22} style={{ color: COLORS.ink60 }} />
        <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="mt-3 text-lg font-semibold">
          Exam Locked
        </h2>
        <p className="mt-1 max-w-sm text-sm" style={{ color: COLORS.ink60 }}>
          Complete every lesson, quiz, exercise, and workshop in the modules above to unlock the final certification
          exam.
        </p>
      </div>
    );
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  if (stage === "intro") {
    return (
      <div className="rounded-xl p-6" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide" style={{ color: COLORS.crimson, backgroundColor: `${COLORS.crimson}14` }}>
          <ShieldCheck size={12} /> Certification Exam
        </span>
        <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="mt-2 text-xl font-semibold">
          {item.title}
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}` }}>
            <div className="text-lg font-semibold" style={{ color: COLORS.ink, fontFamily: "IBM Plex Mono, monospace" }}>
              {EXAM_QUESTIONS.length}
            </div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
              Questions
            </div>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}` }}>
            <div className="text-lg font-semibold" style={{ color: COLORS.ink, fontFamily: "IBM Plex Mono, monospace" }}>
              20 min
            </div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
              Time Limit
            </div>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}` }}>
            <div className="text-lg font-semibold" style={{ color: COLORS.ink, fontFamily: "IBM Plex Mono, monospace" }}>
              80%
            </div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
              Passing Score
            </div>
          </div>
        </div>
        <ul className="mt-4 list-inside list-disc space-y-1 text-xs" style={{ color: COLORS.ink60 }}>
          <li>Once started, the timer cannot be paused.</li>
          <li>All answers are final after submission.</li>
          <li>Results are reviewed and verified by a certified assessor before your certificate is issued.</li>
        </ul>
        <button onClick={() => setStage("in_progress")} className="mt-5 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: COLORS.crimson }}>
          Start Exam
        </button>
      </div>
    );
  }

  if (stage === "in_progress") {
    const q = EXAM_QUESTIONS[current];
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs" style={{ color: COLORS.ink60 }}>
            Question {current + 1} of {EXAM_QUESTIONS.length}
          </span>
          <span className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium" style={{ color: COLORS.crimson, backgroundColor: `${COLORS.crimson}14` }}>
            <Timer size={12} /> {mm}:{ss}
          </span>
        </div>
        <div className="rounded-lg p-5" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <div className="text-sm font-medium" style={{ color: COLORS.ink }}>
            {q.q}
          </div>
          <div className="mt-3 space-y-2">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                onClick={() => setAnswers((a) => ({ ...a, [current]: oi }))}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm"
                style={{
                  border: `1px solid ${answers[current] === oi ? COLORS.primary : COLORS.line}`,
                  backgroundColor: answers[current] === oi ? `${COLORS.primary}0F` : COLORS.paper,
                  color: COLORS.ink,
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium disabled:opacity-40"
            style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
          >
            <ChevronLeft size={13} /> Previous
          </button>
          {current < EXAM_QUESTIONS.length - 1 ? (
            <button onClick={() => setCurrent((c) => c + 1)} className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
              Next <ChevronRight size={13} />
            </button>
          ) : (
            <button onClick={() => setStage("submitted")} className="flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium text-white" style={{ backgroundColor: COLORS.crimson }}>
              <Send size={13} /> Submit Exam
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl p-10 text-center" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${COLORS.crimson}14` }}>
        <ShieldCheck size={22} style={{ color: COLORS.crimson }} />
      </div>
      <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="mt-3 text-lg font-semibold">
        Exam Submitted
      </h2>
      <p className="mt-1 max-w-sm text-sm" style={{ color: COLORS.ink60 }}>
        Your answers have been recorded and sent for assessor review. Final results and certificate issuance
        typically take 3–5 working days.
      </p>
      <span className="mt-3 rounded-full px-3 py-1 text-xs font-medium" style={{ color: COLORS.amber, backgroundColor: `${COLORS.amber}14` }}>
        Status: Awaiting Assessor Review
      </span>
    </div>
  );
}

export default function CoursePlayer() {
  const flat = useMemo(() => flattenItems(), []);
  const [completedIds, setCompletedIds] = useState(INITIAL_COMPLETED);
  const [selectedId, setSelectedId] = useState("2-2");

  const isLocked = (index) => index > 0 && !completedIds.has(flat[index - 1].id);
  const markComplete = (id) => setCompletedIds((prev) => new Set(prev).add(id));

  const selectedIndex = flat.findIndex((f) => f.id === selectedId);
  const selectedItem = flat[selectedIndex];
  const selectedLocked = isLocked(selectedIndex);

  const progressPct = Math.round((completedIds.size / flat.length) * 100);

  return (
    <div className="flex min-h-screen w-full" style={{ backgroundColor: COLORS.paper, fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
      `}</style>

      {/* Curriculum sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col p-5 sm:flex" style={{ backgroundColor: COLORS.card, borderRight: `1px solid ${COLORS.line}` }}>
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: `${COLORS.primary}14` }}>
            <Award size={14} style={{ color: COLORS.primary }} />
          </div>
          <span className="text-xs" style={{ color: COLORS.ink60 }}>
            DeAcademy
          </span>
        </div>
        <h1 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="mt-2 text-base font-semibold leading-snug">
          {COURSE_TITLE}
        </h1>
        <div className="mt-3 flex items-center gap-2">
          <ProgressBar value={progressPct} color={COLORS.primary} />
          <span className="whitespace-nowrap text-xs" style={{ color: COLORS.ink60 }}>
            {progressPct}%
          </span>
        </div>

        <div className="mt-5 flex-1 space-y-5 overflow-y-auto">
          {MODULES.map((m) => (
            <div key={m.id}>
              <div className="mb-1.5 text-xs font-medium" style={{ color: COLORS.ink }}>
                {m.title}
              </div>
              <div className="space-y-0.5">
                {m.items.map((it) => {
                  const idx = flat.findIndex((f) => f.id === it.id);
                  return (
                    <SidebarItem
                      key={it.id}
                      item={it}
                      active={selectedId === it.id}
                      locked={isLocked(idx)}
                      completed={completedIds.has(it.id)}
                      onClick={setSelectedId}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 px-5 py-6 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center gap-1.5 text-xs sm:hidden" style={{ color: COLORS.ink60 }}>
            <ListChecks size={13} /> {progressPct}% complete
          </div>

          {progressPct === 100 && (
            <div className="mb-5 flex items-center gap-3 rounded-lg p-4" style={{ backgroundColor: `${COLORS.sage}12`, border: `1px solid ${COLORS.sage}35` }}>
              <Award size={18} style={{ color: COLORS.sage }} />
              <div>
                <div className="text-sm font-medium" style={{ color: COLORS.ink }}>
                  Course completed
                </div>
                <div className="text-xs" style={{ color: COLORS.ink60 }}>
                  Your certificate has been issued. All lessons, quizzes, and resources below remain open — come back
                  anytime to refresh your knowledge.
                </div>
              </div>
            </div>
          )}

          {selectedLocked && (
            <div className="flex flex-col items-center justify-center rounded-xl p-10 text-center" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <Lock size={20} style={{ color: COLORS.ink60 }} />
              <p className="mt-2 text-sm" style={{ color: COLORS.ink60 }}>
                Complete the previous step to unlock this content.
              </p>
            </div>
          )}

          {!selectedLocked && selectedItem?.type === "lesson" && selectedItem?.contentType === "slides" && (
            <SlideDeckPlayer key={selectedItem.id} item={selectedItem} completed={completedIds.has(selectedItem.id)} onComplete={() => markComplete(selectedItem.id)} />
          )}

          {!selectedLocked && selectedItem?.type === "lesson" && selectedItem?.contentType !== "slides" && (
            <LessonView item={selectedItem} completed={completedIds.has(selectedItem.id)} onComplete={() => markComplete(selectedItem.id)} />
          )}

          {!selectedLocked && selectedItem?.type === "quiz" && (
            <QuizView key={selectedItem.id} item={selectedItem} quiz={QUIZ_BANK[selectedItem.id]} completed={completedIds.has(selectedItem.id)} onPass={markComplete} />
          )}

          {!selectedLocked && selectedItem?.type === "exercise" && (
            <ExerciseView item={selectedItem} completed={completedIds.has(selectedItem.id)} onSubmitDone={markComplete} />
          )}

          {!selectedLocked && selectedItem?.type === "workshop" && (
            <WorkshopView item={selectedItem} completed={completedIds.has(selectedItem.id)} onSubmitDone={markComplete} />
          )}

          {selectedItem?.type === "exam" && <ExamView item={selectedItem} locked={selectedLocked} />}
        </div>
      </main>
    </div>
  );
}

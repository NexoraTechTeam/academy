/* ============================================================================
   DeAcademy portal prototype — v3 context note (2026-08-24)

   The current integrated prototype is the unified app (`lsp-unified-app.html`):
   one login, one shell, a workspace switcher across roles (incl. the new
   Super Admin workspace), guest browsing, and attribute-driven upsells.
   This file remains the detailed per-workspace feature reference.

   v3: catalog is also browsable by guests without an account (unified app landing).

   Cross-references: docs/PRD.md §4.9–4.11 & §5a, docs/DATA-MODEL.md §1.1 & §9,
   src/positions-master-data.js (position master data + upsell rules).
   ============================================================================ */
import React, { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  Users2,
  CalendarClock,
  Award,
  ShoppingCart,
  X,
  Check,
  ChevronLeft,
  CreditCard,
  Building2,
  UserCircle2,
  Tag,
  Layers,
  ClipboardCheck,
} from "lucide-react";

// Same design tokens as the participant dashboard, kept in sync.
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
  violet: "#6D5BD0",
  line: "#E3E7F0",
};

const CATEGORIES = ["All", "Professional Certification", "Internal · Compliance", "General Development", "Skill Development"];

const courses = [
  {
    id: 1,
    title: "ISO 9001:2015 Quality Management",
    category: "Professional Certification",
    level: "Intermediate",
    price: 3200000,
    rating: 4.8,
    reviews: 214,
    duration: "24 hrs · self-paced",
    nextSchedule: "Jul 22, 2026",
    seatsLeft: 8,
    cpdHours: 24,
    format: "Online + Exam",
    tag: "Popular",
    description:
      "Learn the core requirements of the ISO 9001:2015 quality management standard and how to apply them to real operational processes, from documentation through internal audit.",
    objectives: [
      "Explain the seven quality management principles behind ISO 9001:2015",
      "Interpret each clause of the standard and map it to your organization's processes",
      "Prepare the documentation required for a certification audit",
      "Identify nonconformities and design effective corrective actions",
    ],
    syllabus: [
      { module: "Module 1", title: "Introduction to Quality Management Systems", topics: ["History of ISO 9001", "QMS principles", "The process approach"] },
      { module: "Module 2", title: "Standard Requirements Deep Dive", topics: ["Context of the organization", "Leadership & planning", "Support & operation"] },
      { module: "Module 3", title: "Internal Audit & Certification Readiness", topics: ["Gap analysis", "Documentation review", "Mock certification audit"] },
    ],
    prerequisites: "Basic familiarity with your organization's operational processes. No prior ISO experience required.",
    audience: "Quality managers, process owners, and anyone preparing for an ISO 9001 certification audit.",
  },
  {
    id: 2,
    title: "Competency Assessor Certification (BNSP)",
    category: "Professional Certification",
    level: "Advanced",
    price: 4500000,
    rating: 4.9,
    reviews: 341,
    duration: "40 hrs · cohort-based",
    nextSchedule: "Aug 3, 2026",
    seatsLeft: 5,
    cpdHours: 40,
    format: "Blended + Exam",
    tag: "Certification",
    description:
      "Become a BNSP-registered competency assessor, qualified to design and conduct competency-based assessments under Indonesia's national professional certification framework.",
    objectives: [
      "Apply the principles of competency-based assessment (Validity, Reliability, Fairness, Flexibility)",
      "Design assessment instruments aligned to a unit of competency",
      "Conduct a mock assessment session and gather sufficient evidence",
      "Pass the BNSP-aligned certification exam, reviewed by a certified examiner",
    ],
    syllabus: [
      { module: "Module 1", title: "Introduction to Competency-Based Assessment", topics: ["What is CBA", "Roles of tutor & examiner", "Knowledge check quiz"] },
      { module: "Module 2", title: "Designing Assessment Instruments", topics: ["Instrument design principles", "Evidence sufficiency", "Hands-on exercise"] },
      { module: "Module 3", title: "Practical Application", topics: ["Facilitated mock assessment workshop", "Peer feedback"] },
      { module: "Final", title: "Certification Final Exam", topics: ["Timed exam", "Reviewed by a certified examiner", "Certificate on pass"] },
    ],
    prerequisites: "At least 1 year of relevant professional experience in your assessment field is recommended.",
    audience: "Prospective assessors, HR/L&D staff, and subject-matter experts supporting certification programs.",
  },
  {
    id: 3,
    title: "Effective Communication for Assessors",
    category: "General Development",
    level: "Beginner",
    price: 950000,
    rating: 4.6,
    reviews: 88,
    duration: "8 hrs · self-paced",
    nextSchedule: "Aug 5, 2026",
    seatsLeft: 12,
    cpdHours: 8,
    format: "Online",
    description: "Sharpen the interviewing, feedback, and questioning skills assessors and tutors rely on to run fair, productive assessment sessions.",
    objectives: [
      "Ask open, evidence-focused questions during an assessment interview",
      "Deliver constructive feedback without introducing bias",
      "Manage difficult or anxious candidates during a session",
      "Document assessment conversations clearly and objectively",
    ],
    syllabus: [
      { module: "Module 1", title: "Foundations of Assessment Communication", topics: ["Active listening", "Question framing"] },
      { module: "Module 2", title: "Giving Fair, Actionable Feedback", topics: ["Feedback models", "Avoiding bias"] },
      { module: "Module 3", title: "Handling Difficult Conversations", topics: ["De-escalation", "Documenting objectively"] },
    ],
    prerequisites: "None.",
    audience: "Assessors, tutors, and anyone conducting evaluative or coaching conversations.",
  },
  {
    id: 4,
    title: "2026 H&S Regulation Update",
    category: "Internal · Compliance",
    level: "Beginner",
    price: 0,
    rating: 4.7,
    reviews: 156,
    duration: "4 hrs · self-paced",
    nextSchedule: "Jul 29, 2026",
    seatsLeft: 15,
    cpdHours: 4,
    format: "Online",
    tag: "Internal",
    description: "A mandatory refresher covering what changed in workplace health & safety regulation this year and what it means for your day-to-day role.",
    objectives: [
      "Identify the key regulatory changes introduced in 2026",
      "Recognize how the changes affect your team's existing SOPs",
      "Know where to report a compliance gap internally",
    ],
    syllabus: [
      { module: "Module 1", title: "What Changed in 2026", topics: ["Summary of new regulation", "Comparison to prior policy"] },
      { module: "Module 2", title: "Applying It to Your Role", topics: ["Department-specific implications", "Reporting a gap"] },
    ],
    prerequisites: "None — required for all employees.",
    audience: "All employees, as part of annual compliance refreshment.",
  },
  {
    id: 5,
    title: "Training Proposal Writing Techniques",
    category: "Skill Development",
    level: "Intermediate",
    price: 0,
    rating: 4.5,
    reviews: 62,
    duration: "10 hrs · self-paced",
    nextSchedule: "Rolling enrollment",
    seatsLeft: 20,
    cpdHours: 10,
    format: "Online",
    tag: "Internal",
    description: "Learn to structure a compelling, fundable training proposal — from needs analysis through budget and success metrics.",
    objectives: [
      "Conduct a basic training needs analysis",
      "Structure a proposal with clear objectives, agenda, and budget",
      "Define measurable success metrics for a training program",
    ],
    syllabus: [
      { module: "Module 1", title: "Needs Analysis", topics: ["Identifying the competency gap", "Stakeholder interviews"] },
      { module: "Module 2", title: "Structuring the Proposal", topics: ["Objectives & agenda", "Budgeting"] },
      { module: "Module 3", title: "Defining Success Metrics", topics: ["KPIs for training", "Post-training evaluation"] },
    ],
    prerequisites: "None.",
    audience: "L&D staff, tutors, and anyone proposing new internal training programs.",
  },
  {
    id: 6,
    title: "Internal Audit Fundamentals",
    category: "Professional Certification",
    level: "Intermediate",
    price: 2750000,
    rating: 4.7,
    reviews: 129,
    duration: "16 hrs · cohort-based",
    nextSchedule: "Aug 15, 2026",
    seatsLeft: 10,
    cpdHours: 16,
    format: "Blended",
    description: "Build practical internal audit skills — planning an audit, gathering evidence, and writing findings that lead to real corrective action.",
    objectives: [
      "Plan a risk-based internal audit",
      "Gather and evaluate audit evidence objectively",
      "Draft clear, actionable audit findings",
      "Draft an audit checklist tailored to your organization",
    ],
    syllabus: [
      { module: "Module 1", title: "Audit Planning & Risk Assessment", topics: ["Audit scope", "Risk-based planning"] },
      { module: "Module 2", title: "Fieldwork & Evidence Gathering", topics: ["Sampling methods", "Interview techniques", "Draft an audit checklist"] },
      { module: "Module 3", title: "Reporting & Follow-Up", topics: ["Writing findings", "Tracking corrective actions"] },
    ],
    prerequisites: "Basic understanding of your organization's business processes.",
    audience: "Internal auditors, compliance officers, and department leads supporting audit readiness.",
  },
  {
    id: 7,
    title: "Project Risk Management",
    category: "General Development",
    level: "Intermediate",
    price: 1850000,
    rating: 4.4,
    reviews: 74,
    duration: "12 hrs · self-paced",
    nextSchedule: "Aug 1, 2026",
    seatsLeft: 18,
    cpdHours: 12,
    format: "Online",
    description: "A practical introduction to identifying, assessing, and mitigating risk across the lifecycle of a project.",
    objectives: [
      "Build a project risk register",
      "Assess risk likelihood and impact using a standard matrix",
      "Design mitigation and contingency plans",
      "Communicate risk status to stakeholders",
    ],
    syllabus: [
      { module: "Module 1", title: "Identifying Project Risk", topics: ["Risk register basics", "Common risk categories"] },
      { module: "Module 2", title: "Assessing & Prioritizing Risk", topics: ["Likelihood/impact matrix", "Qualitative vs quantitative analysis"] },
      { module: "Module 3", title: "Mitigation & Communication", topics: ["Response strategies", "Reporting to stakeholders"] },
    ],
    prerequisites: "Basic familiarity with project management concepts is helpful but not required.",
    audience: "Project managers, team leads, and anyone responsible for delivering projects on time and on budget.",
  },
  {
    id: 8,
    title: "K3 Regulatory Compliance for Managers",
    category: "Internal · Compliance",
    level: "Advanced",
    price: 0,
    rating: 4.6,
    reviews: 45,
    duration: "6 hrs · self-paced",
    nextSchedule: "Rolling enrollment",
    seatsLeft: 25,
    cpdHours: 6,
    format: "Online",
    tag: "Internal",
    description: "Manager-level training on Indonesian workplace safety (K3) regulatory obligations, incident reporting, and supervisory accountability.",
    objectives: [
      "Explain a manager's legal obligations under Indonesian K3 regulation",
      "Run a basic workplace hazard identification exercise",
      "Follow the correct internal incident reporting and escalation process",
    ],
    syllabus: [
      { module: "Module 1", title: "K3 Regulatory Framework for Managers", topics: ["Legal obligations", "Manager accountability"] },
      { module: "Module 2", title: "Hazard Identification & Reporting", topics: ["Workplace hazard walk-throughs", "Incident escalation process"] },
    ],
    prerequisites: "Applicable to employees in a supervisory or managerial role.",
    audience: "People managers and supervisors across all departments.",
  },
];

function formatIDR(value) {
  if (value === 0) return "Free";
  return "Rp " + value.toLocaleString("id-ID");
}

function LevelPill({ level }) {
  const color = level === "Beginner" ? COLORS.sage : level === "Intermediate" ? COLORS.cyan : COLORS.violet;
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color, backgroundColor: `${color}14` }}>
      {level}
    </span>
  );
}

function CourseCard({ course, onOpen, inCart, onToggleCart }) {
  return (
    <div className="flex flex-col rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
          {course.category}
        </span>
        {course.tag && (
          <span
            className="whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ color: course.tag === "Internal" ? COLORS.amber : COLORS.primary, backgroundColor: course.tag === "Internal" ? `${COLORS.amber}14` : `${COLORS.primary}14` }}
          >
            {course.tag}
          </span>
        )}
      </div>

      <button onClick={() => onOpen(course)} className="mt-1.5 text-left text-sm font-medium leading-snug" style={{ color: COLORS.ink, fontFamily: "Fraunces, serif" }}>
        {course.title}
      </button>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed" style={{ color: COLORS.ink60 }}>
        {course.description}
      </p>

      <div className="mt-2 flex items-center gap-2">
        <LevelPill level={course.level} />
        <span className="flex items-center gap-1 text-xs" style={{ color: COLORS.ink60 }}>
          <Star size={12} fill={COLORS.amber} stroke="none" /> {course.rating}
          <span className="opacity-70">({course.reviews})</span>
        </span>
      </div>

      <div className="mt-3 space-y-1.5 text-xs" style={{ color: COLORS.ink60 }}>
        <div className="flex items-center gap-1.5">
          <Clock size={12} /> {course.duration}
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarClock size={12} /> Next batch: {course.nextSchedule}
        </div>
        <div className="flex items-center gap-1.5">
          <Users2 size={12} /> {course.seatsLeft} seats left
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-sm font-semibold">
          {formatIDR(course.price)}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={() => onOpen(course)} className="rounded-md px-2.5 py-1.5 text-xs font-medium" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
            Details
          </button>
          <button
            onClick={() => onToggleCart(course)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-white"
            style={{ backgroundColor: inCart ? COLORS.sage : COLORS.primary }}
          >
            {inCart ? <Check size={12} /> : <ShoppingCart size={12} />}
            {inCart ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CourseDetailPanel({ course, onClose, inCart, onToggleCart }) {
  if (!course) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end" style={{ backgroundColor: "rgba(16,27,51,0.45)" }}>
      <div className="h-full w-full max-w-md overflow-y-auto p-6" style={{ backgroundColor: COLORS.paper }}>
        <button onClick={onClose} className="mb-4 flex items-center gap-1 text-xs font-medium" style={{ color: COLORS.ink60 }}>
          <ChevronLeft size={14} /> Back to catalog
        </button>

        <span className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
          {course.category}
        </span>
        <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="mt-1 text-xl font-semibold leading-snug">
          {course.title}
        </h2>

        <div className="mt-3 flex items-center gap-2">
          <LevelPill level={course.level} />
          <span className="flex items-center gap-1 text-xs" style={{ color: COLORS.ink60 }}>
            <Star size={12} fill={COLORS.amber} stroke="none" /> {course.rating} ({course.reviews} reviews)
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg p-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
              <Clock size={11} /> Duration
            </div>
            <div className="mt-1 text-sm font-medium" style={{ color: COLORS.ink }}>
              {course.duration}
            </div>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
              <Layers size={11} /> Format
            </div>
            <div className="mt-1 text-sm font-medium" style={{ color: COLORS.ink }}>
              {course.format}
            </div>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
              <CalendarClock size={11} /> Next Batch
            </div>
            <div className="mt-1 text-sm font-medium" style={{ color: COLORS.ink }}>
              {course.nextSchedule}
            </div>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
              <Users2 size={11} /> Seats Left
            </div>
            <div className="mt-1 text-sm font-medium" style={{ color: COLORS.ink }}>
              {course.seatsLeft}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed" style={{ color: COLORS.ink }}>
          {course.description}
        </p>

        <div className="mt-3 flex items-center gap-2 rounded-lg p-3" style={{ backgroundColor: `${COLORS.amber}12`, border: `1px solid ${COLORS.amber}30` }}>
          <ClipboardCheck size={14} style={{ color: COLORS.amber }} />
          <span className="text-xs" style={{ color: COLORS.ink }}>
            Completing this training earns <strong>{course.cpdHours} CPD hours</strong> toward your certification.
          </span>
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-medium" style={{ color: COLORS.ink }}>
            Learning Objectives
          </h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs" style={{ color: COLORS.ink60 }}>
            {course.objectives.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-medium" style={{ color: COLORS.ink }}>
            Syllabus
          </h3>
          <div className="mt-2 space-y-2">
            {course.syllabus.map((m, i) => (
              <div key={i} className="rounded-lg p-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.primary }}>
                  {m.module}
                </div>
                <div className="mt-0.5 text-sm font-medium" style={{ color: COLORS.ink }}>
                  {m.title}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {m.topics.map((t, ti) => (
                    <span key={ti} className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: COLORS.paper, color: COLORS.ink60 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-lg p-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
              Prerequisites
            </div>
            <div className="mt-1 text-xs" style={{ color: COLORS.ink }}>
              {course.prerequisites}
            </div>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
              Who Should Attend
            </div>
            <div className="mt-1 text-xs" style={{ color: COLORS.ink }}>
              {course.audience}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <span style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-lg font-semibold">
            {formatIDR(course.price)}
          </span>
          <button
            onClick={() => onToggleCart(course)}
            className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: inCart ? COLORS.sage : COLORS.primary }}
          >
            {inCart ? <Check size={14} /> : <ShoppingCart size={14} />}
            {inCart ? "Added to Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckoutPanel({ cart, onClose, onConfirm, buyerType, setBuyerType }) {
  const total = cart.reduce((a, c) => a + c.price, 0);
  return (
    <div className="fixed inset-0 z-40 flex justify-end" style={{ backgroundColor: "rgba(16,27,51,0.45)" }}>
      <div className="flex h-full w-full max-w-md flex-col p-6" style={{ backgroundColor: COLORS.paper }}>
        <div className="flex items-center justify-between">
          <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-xl font-semibold">
            Checkout
          </h2>
          <button onClick={onClose}>
            <X size={18} style={{ color: COLORS.ink60 }} />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setBuyerType("individual")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium"
            style={{
              backgroundColor: buyerType === "individual" ? COLORS.primary : COLORS.card,
              color: buyerType === "individual" ? "#fff" : COLORS.ink,
              border: `1px solid ${buyerType === "individual" ? COLORS.primary : COLORS.line}`,
            }}
          >
            <UserCircle2 size={14} /> Individual
          </button>
          <button
            onClick={() => setBuyerType("corporate")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium"
            style={{
              backgroundColor: buyerType === "corporate" ? COLORS.primary : COLORS.card,
              color: buyerType === "corporate" ? "#fff" : COLORS.ink,
              border: `1px solid ${buyerType === "corporate" ? COLORS.primary : COLORS.line}`,
            }}
          >
            <Building2 size={14} /> Corporate
          </button>
        </div>

        {buyerType === "corporate" && (
          <div className="mt-3 rounded-lg p-3 text-xs" style={{ backgroundColor: `${COLORS.violet}12`, border: `1px solid ${COLORS.violet}30`, color: COLORS.ink }}>
            Corporate purchases let you assign seats to specific employees and monitor their progress from the Company Admin dashboard after checkout.
          </div>
        )}

        <div className="mt-5 flex-1 space-y-2 overflow-y-auto">
          {cart.length === 0 && (
            <div className="mt-10 text-center text-sm" style={{ color: COLORS.ink60 }}>
              Your cart is empty.
            </div>
          )}
          {cart.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg p-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div>
                <div className="text-sm font-medium" style={{ color: COLORS.ink }}>
                  {c.title}
                </div>
                <div className="text-xs" style={{ color: COLORS.ink60 }}>
                  Next batch: {c.nextSchedule}
                </div>
              </div>
              <span style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-sm">
                {formatIDR(c.price)}
              </span>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="mt-4 border-t pt-4" style={{ borderColor: COLORS.line }}>
            <div className="flex items-center justify-between text-sm" style={{ color: COLORS.ink }}>
              <span>Total</span>
              <span style={{ fontFamily: "IBM Plex Mono, monospace" }} className="text-lg font-semibold">
                {formatIDR(total)}
              </span>
            </div>
            <button onClick={onConfirm} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
              <CreditCard size={14} /> Proceed to Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmationPanel({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: "rgba(16,27,51,0.55)" }}>
      <div className="w-full max-w-sm rounded-xl p-6 text-center" style={{ backgroundColor: COLORS.card }}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${COLORS.sage}18` }}>
          <Check size={22} style={{ color: COLORS.sage }} />
        </div>
        <h3 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="mt-4 text-lg font-semibold">
          Purchase Confirmed
        </h3>
        <p className="mt-1 text-sm" style={{ color: COLORS.ink60 }}>
          Your training has been added to "My Trainings." You'll receive a reminder before each session starts.
        </p>
        <button onClick={onClose} className="mt-5 w-full rounded-md py-2 text-sm font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
          Go to My Trainings
        </button>
      </div>
    </div>
  );
}

export default function TrainingCatalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [openCourse, setOpenCourse] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [buyerType, setBuyerType] = useState("individual");

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesQuery = c.title.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All" || c.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  const isInCart = (course) => cart.some((c) => c.id === course.id);
  const toggleCart = (course) => {
    setCart((prev) => (prev.some((c) => c.id === course.id) ? prev.filter((c) => c.id !== course.id) : [...prev, course]));
  };
  const confirmPurchase = () => {
    setShowCheckout(false);
    setShowConfirm(true);
    setCart([]);
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: COLORS.paper, fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
      `}</style>

      <header className="sticky top-0 z-30 px-5 py-4 sm:px-8" style={{ backgroundColor: COLORS.primaryDeep }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: COLORS.primary }}>
              <Award size={16} color="#fff" />
            </div>
            <span style={{ fontFamily: "Fraunces, serif" }} className="text-sm font-semibold text-white">
              DeAcademy
            </span>
          </div>
          <button
            onClick={() => setShowCheckout(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
          >
            <ShoppingCart size={16} color="#fff" />
            {cart.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-semibold text-white" style={{ backgroundColor: COLORS.amber }}>
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="px-5 py-6 sm:px-8">
        <div className="mb-6">
          <h1 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-2xl font-semibold">
            Training Catalog
          </h1>
          <p className="mt-1 text-sm" style={{ color: COLORS.ink60 }}>
            Browse certification programs and professional development courses
          </p>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-md px-3 py-2" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <Search size={15} style={{ color: COLORS.ink60 }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search trainings…"
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: COLORS.ink }}
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: COLORS.ink60 }}>
            <SlidersHorizontal size={13} /> {filtered.length} results
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
              style={{
                backgroundColor: category === c ? COLORS.primary : COLORS.card,
                color: category === c ? "#fff" : COLORS.ink,
                border: `1px solid ${category === c ? COLORS.primary : COLORS.line}`,
              }}
            >
              <Tag size={11} /> {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} onOpen={setOpenCourse} inCart={isInCart(course)} onToggleCart={toggleCart} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center text-sm" style={{ color: COLORS.ink60 }}>
            No trainings match your search.
          </div>
        )}
      </main>

      {openCourse && <CourseDetailPanel course={openCourse} onClose={() => setOpenCourse(null)} inCart={isInCart(openCourse)} onToggleCart={toggleCart} />}
      {showCheckout && <CheckoutPanel cart={cart} onClose={() => setShowCheckout(false)} onConfirm={confirmPurchase} buyerType={buyerType} setBuyerType={setBuyerType} />}
      {showConfirm && <ConfirmationPanel onClose={() => setShowConfirm(false)} />}
    </div>
  );
}

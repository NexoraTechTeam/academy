/* ============================================================================
   DeAcademy portal prototype — v3 context note (2026-08-24)

   The current integrated prototype is the unified app (`lsp-unified-app.html`):
   one login, one shell, a workspace switcher across roles (incl. the new
   Super Admin workspace), guest browsing, and attribute-driven upsells.
   This file remains the detailed per-workspace feature reference.

   v3: shell also carries the locked 'Verify Talent' upsell (rendered by the unified shell, copy interpolates the company name).

   Cross-references: docs/PRD.md §4.9–4.11 & §5a, docs/DATA-MODEL.md §1.1 & §9,
   src/positions-master-data.js (position master data + upsell rules).
   ============================================================================ */
import React, { useState, useMemo, useRef } from "react";
import {
  LayoutGrid,
  Users2,
  BookOpen,
  ClipboardCheck,
  Bell,
  Search,
  ChevronRight,
  Building2,
  Award,
  Mail,
  AlertTriangle,
  UserPlus,
  CheckSquare,
  Square,
  Send,
  Calendar,
  Smile,
  Percent,
  Lock,
  Plus,
  X,
  Video,
  Presentation,
  Upload,
  Check,
  Info,
  GraduationCap,
  Download,
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

// This portal is scoped entirely to one company — data below mirrors PT Sumber Makmur's
// record in the LSP Operator console, so the two stay consistent.
const COMPANY = {
  name: "PT Sumber Makmur",
  industry: "Manufacturing",
  seatsPurchased: 50,
  seatsUsed: 34,
  trainingCompliance: 58,
  cpdCompliance: 62,
  satisfaction: 3.8,
  avgCompletionDays: 26,
  completedPct: 52,
  inProgressPct: 27,
  notStartedPct: 21,
  completedOnTimePct: 64,
  completedLatePct: 36,
};

const EMPLOYEES = [
  {
    id: 1,
    employeeId: "EMP-1042",
    name: "Budi Santoso",
    department: "Quality Assurance",
    position: "Supervisor",
    assigned: 3,
    completed: 1,
    certs: 1,
    cpd: "At Risk",
    lastActive: "2 days ago",
    trainingHistory: [{ title: "2026 H&S Regulation Update", status: "completed", date: "May 2026" }],
  },
  {
    id: 2,
    employeeId: "EMP-2078",
    name: "Agus Prabowo",
    department: "Production",
    position: "Staff",
    assigned: 2,
    completed: 0,
    certs: 0,
    cpd: "Non-Compliant",
    lastActive: "2 weeks ago",
    trainingHistory: [],
  },
  {
    id: 3,
    employeeId: "EMP-1103",
    name: "Siti Aminah",
    department: "Quality Assurance",
    position: "Manager",
    assigned: 3,
    completed: 3,
    certs: 2,
    cpd: "Compliant",
    lastActive: "Today",
    trainingHistory: [{ title: "Competency Assessor Certification (BNSP)", status: "completed", date: "Mar 2026" }],
  },
  {
    id: 4,
    employeeId: "EMP-3015",
    name: "Farhan Nugroho",
    department: "Finance",
    position: "Staff",
    assigned: 2,
    completed: 1,
    certs: 0,
    cpd: "At Risk",
    lastActive: "5 days ago",
    trainingHistory: [],
  },
  {
    id: 5,
    employeeId: "EMP-1077",
    name: "Dewi Lestari",
    department: "Internal Audit",
    position: "Supervisor",
    assigned: 3,
    completed: 2,
    certs: 1,
    cpd: "Compliant",
    lastActive: "Yesterday",
    trainingHistory: [{ title: "Internal Audit Fundamentals", status: "completed", date: "Feb 2026" }],
  },
  {
    id: 6,
    employeeId: "EMP-2091",
    name: "Rizky Ramadhan",
    department: "Production",
    position: "Staff",
    assigned: 1,
    completed: 0,
    certs: 0,
    cpd: "Non-Compliant",
    lastActive: "3 weeks ago",
    trainingHistory: [],
  },
  {
    id: 7,
    employeeId: "EMP-1108",
    name: "Ayu Kartikasari",
    department: "Quality Assurance",
    position: "Manager",
    assigned: 3,
    completed: 3,
    certs: 2,
    cpd: "Compliant",
    lastActive: "Today",
    trainingHistory: [{ title: "Competency Assessor Certification (BNSP)", status: "completed", date: "Mar 2026" }],
  },
  {
    id: 8,
    employeeId: "EMP-3042",
    name: "Hendra Saputra",
    department: "Human Resources",
    position: "Staff",
    assigned: 2,
    completed: 1,
    certs: 0,
    cpd: "At Risk",
    lastActive: "6 days ago",
    trainingHistory: [{ title: "New Employee Induction Program", status: "completed", date: "Jul 2026" }],
  },
  {
    id: 9,
    employeeId: "EMP-4021",
    name: "Budi Santoso",
    department: "Production",
    position: "Staff",
    assigned: 1,
    completed: 0,
    certs: 0,
    cpd: "Non-Compliant",
    lastActive: "1 week ago",
    trainingHistory: [],
  },
];

const TRAINING_ASSIGNMENTS = [
  { training: "Competency Assessor Certification (BNSP)", assigned: 10, certsIssued: 6, passed: 5, failed: 1, avgDays: 29 },
  { training: "2026 H&S Regulation Update", assigned: 34, certsIssued: 30, passed: 30, failed: 0, avgDays: 4 },
  { training: "Internal Audit Fundamentals", assigned: 8, certsIssued: 3, passed: 3, failed: 0, avgDays: 24 },
];

const CATALOG_OPTIONS = [
  "Competency Assessor Certification (BNSP)",
  "ISO 9001:2015 Quality Management",
  "Internal Audit Fundamentals",
  "Project Risk Management",
  "2026 H&S Regulation Update",
];

const INTERNAL_CATEGORY_OPTIONS = ["Employee Induction", "Compliance & Policy", "Internal Competency", "Process / SOP", "Other"];

const INTERNAL_TRAININGS_INITIAL = [
  {
    id: "int-1",
    title: "New Employee Induction Program",
    category: "Employee Induction",
    status: "published",
    assigned: 12,
    completed: 9,
    description: "Company history, values, org structure, and first-week essentials for every new hire.",
    objectives: ["Understand PT Sumber Makmur's mission and org structure", "Complete mandatory HR & IT onboarding steps", "Know who to contact for common first-week questions"],
    syllabus: [
      { module: "Module 1", title: "Welcome to PT Sumber Makmur", topics: ["Company history & values", "Org structure", "Meet your team"] },
      { module: "Module 2", title: "Policies & Systems", topics: ["HR policies overview", "IT systems walkthrough", "Facility & safety orientation"] },
    ],
  },
  {
    id: "int-2",
    title: "Factory Safety SOP Refresher",
    category: "Process / SOP",
    status: "draft",
    assigned: 0,
    completed: 0,
    description: "",
    objectives: [],
    syllabus: [],
  },
];

const CERTIFICATES = [
  { cert: "Competency Assessor Certificate", holder: "Siti Aminah", issued: "Mar 4, 2026", refreshBy: "Mar 4, 2029", cpdStatus: "On Track" },
  { cert: "Competency Assessor Certificate", holder: "Ayu Kartikasari", issued: "Mar 4, 2026", refreshBy: "Mar 4, 2029", cpdStatus: "On Track" },
  { cert: "H&S Regulation Awareness Certificate", holder: "Budi Santoso", issued: "Jun 1, 2026", refreshBy: "No expiry", cpdStatus: "Not Required" },
  { cert: "Internal Audit Fundamentals Certificate", holder: "Dewi Lestari", issued: "Feb 20, 2026", refreshBy: "Feb 20, 2027", cpdStatus: "Behind" },
  { cert: "New Employee Induction Program Certificate", holder: "Hendra Saputra", issued: "Jul 10, 2026", refreshBy: "No expiry", cpdStatus: "Not Required" },
];

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
  const map = { Compliant: COLORS.sage, "On Track": COLORS.sage, "At Risk": COLORS.amber, Behind: COLORS.amber, "Non-Compliant": COLORS.crimson, "Not Required": COLORS.ink60 };
  return <Pill color={map[status] || COLORS.ink60}>{status}</Pill>;
}

// ---------------- Dashboard ----------------
function DashboardTab() {
  const [exported, setExported] = useState(false);
  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setExported(true);
            setTimeout(() => setExported(false), 2000);
          }}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white"
          style={{ backgroundColor: exported ? COLORS.sage : COLORS.primary }}
        >
          {exported ? <Check size={13} /> : <Download size={13} />} {exported ? "Exported" : "Export Report (PDF)"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile Icon={Users2} accent={COLORS.primary} eyebrow="Employees Enrolled" value={COMPANY.seatsUsed} sub={`of ${COMPANY.seatsPurchased} seats purchased`} />
        <StatTile Icon={Percent} accent={COMPANY.trainingCompliance < 70 ? COLORS.crimson : COLORS.sage} eyebrow="Training Compliance" value={`${COMPANY.trainingCompliance}%`} sub="Assigned trainings completed on time" />
        <StatTile Icon={ClipboardCheck} accent={COMPANY.cpdCompliance < 70 ? COLORS.crimson : COLORS.sage} eyebrow="CPD Compliance" value={`${COMPANY.cpdCompliance}%`} sub="Certified employees on track" />
        <StatTile Icon={Smile} accent={COLORS.amber} eyebrow="Platform Satisfaction" value={`${COMPANY.satisfaction}/5`} sub="From post-training survey" />
      </div>

      {(COMPANY.trainingCompliance < 70 || COMPANY.cpdCompliance < 70) && (
        <div className="flex items-start gap-3 rounded-lg px-4 py-3" style={{ backgroundColor: `${COLORS.crimson}0F`, border: `1px solid ${COLORS.crimson}35` }}>
          <AlertTriangle size={16} style={{ color: COLORS.crimson }} className="mt-0.5 shrink-0" />
          <span className="text-sm" style={{ color: COLORS.ink }}>
            Training and CPD compliance are both below target this quarter. 4 employees haven't started an assigned
            training, and 2 certified employees are behind on CPD hours — see the Employees tab to follow up.
          </span>
        </div>
      )}

      <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
          Progress Distribution
        </div>
        <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full">
          <div style={{ width: `${COMPANY.completedPct}%`, backgroundColor: COLORS.sage }} />
          <div style={{ width: `${COMPANY.inProgressPct}%`, backgroundColor: COLORS.cyan }} />
          <div style={{ width: `${COMPANY.notStartedPct}%`, backgroundColor: COLORS.line }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[11px]" style={{ color: COLORS.ink60 }}>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.sage }} /> Completed {COMPANY.completedPct}%
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.cyan }} /> In Progress {COMPANY.inProgressPct}%
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.line }} /> Not Started {COMPANY.notStartedPct}%
          </span>
        </div>
      </div>

      <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="text-xs font-medium" style={{ color: COLORS.ink }}>
          Of Completed Trainings: On-Time vs Late
        </div>
        <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full">
          <div style={{ width: `${COMPANY.completedOnTimePct}%`, backgroundColor: COLORS.sage }} />
          <div style={{ width: `${COMPANY.completedLatePct}%`, backgroundColor: COLORS.amber }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[11px]" style={{ color: COLORS.ink60 }}>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.sage }} /> On-Time {COMPANY.completedOnTimePct}%
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.amber }} /> Completed Late {COMPANY.completedLatePct}%
          </span>
        </div>
        {COMPANY.completedLatePct > 25 && (
          <p className="mt-2 text-[11px]" style={{ color: COLORS.amber }}>
            Over a third of completions are missing their deadline — worth reviewing assigned deadlines or workload per department.
          </p>
        )}
      </div>

      <div>
        <SectionHeader title="Trainings Assigned to Your Team" sub="Progress and outcomes per program" />
        <div className="space-y-2">
          {TRAINING_ASSIGNMENTS.map((t, i) => (
            <div key={i} className="rounded-lg p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="text-sm font-medium" style={{ color: COLORS.ink }}>
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
    </div>
  );
}

// ---------------- Employees ----------------
function EmployeesTab() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      EMPLOYEES.filter(
        (e) =>
          e.name.toLowerCase().includes(query.toLowerCase()) ||
          e.employeeId.toLowerCase().includes(query.toLowerCase()) ||
          e.department.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <div>
      <SectionHeader
        title="Employees"
        sub={`${COMPANY.seatsUsed} of ${COMPANY.seatsPurchased} seats used`}
        right={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <Search size={13} style={{ color: COLORS.ink60 }} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, ID, or department…" className="bg-transparent text-xs outline-none" style={{ color: COLORS.ink }} />
            </div>
            <button className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
              <UserPlus size={13} /> Add Employee
            </button>
          </div>
        }
      />
      <div className="overflow-hidden rounded-lg" style={{ border: `1px solid ${COLORS.line}` }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ backgroundColor: COLORS.paper }}>
              {["Employee", "ID", "Department", "Position", "Trainings", "Certificates", "CPD Status", "Last Active", ""].map((h) => (
                <th key={h} className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} style={{ borderTop: `1px solid ${COLORS.line}`, backgroundColor: COLORS.card }}>
                <td className="px-4 py-2.5 text-sm font-medium" style={{ color: COLORS.ink }}>
                  {e.name}
                </td>
                <td className="px-4 py-2.5 text-xs" style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink60 }}>
                  {e.employeeId}
                </td>
                <td className="px-4 py-2.5 text-xs" style={{ color: COLORS.ink60 }}>
                  {e.department}
                </td>
                <td className="px-4 py-2.5 text-xs" style={{ color: COLORS.ink60 }}>
                  {e.position}
                </td>
                <td className="px-4 py-2.5 text-xs" style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }}>
                  {e.completed}/{e.assigned}
                </td>
                <td className="px-4 py-2.5 text-xs" style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }}>
                  {e.certs}
                </td>
                <td className="px-4 py-2.5">
                  <CpdPill status={e.cpd} />
                </td>
                <td className="px-4 py-2.5 text-xs" style={{ color: COLORS.ink60 }}>
                  {e.lastActive}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {(e.cpd === "At Risk" || e.cpd === "Non-Compliant") && (
                    <button className="flex items-center gap-1 text-xs font-medium" style={{ color: COLORS.primary }}>
                      <Mail size={11} /> Remind
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs" style={{ color: COLORS.ink60 }}>
        Showing {filtered.length} of {COMPANY.seatsUsed} employees.
      </p>
    </div>
  );
}

// ---------------- Internal Trainings ----------------
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

const BLANK_INTERNAL_TRAINING = {
  title: "",
  category: INTERNAL_CATEGORY_OPTIONS[0],
  status: "draft",
  description: "",
  objectives: [],
  syllabus: [],
  assigned: 0,
  completed: 0,
};

function InternalTrainingFormPanel({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial ?? BLANK_INTERNAL_TRAINING);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const canSubmit = form.title.trim().length > 0;

  return (
    <div className="fixed inset-0 z-40 flex justify-end" style={{ backgroundColor: "rgba(16,27,51,0.45)" }}>
      <div className="h-full w-full max-w-lg overflow-y-auto p-6" style={{ backgroundColor: COLORS.paper }}>
        <div className="flex items-center justify-between">
          <h2 style={{ fontFamily: "Fraunces, serif", color: COLORS.ink }} className="text-xl font-semibold">
            {initial ? "Edit Internal Training" : "New Internal Training"}
          </h2>
          <button onClick={onClose}>
            <X size={18} style={{ color: COLORS.ink60 }} />
          </button>
        </div>
        <div className="mt-2 flex items-start gap-2 rounded-lg p-3 text-xs" style={{ backgroundColor: `${COLORS.violet}0F`, border: `1px solid ${COLORS.violet}30`, color: COLORS.ink }}>
          <Lock size={13} style={{ color: COLORS.violet }} className="mt-0.5 shrink-0" />
          Private to {COMPANY.name}. Not listed in the DeAcademy public catalog, not visible to other companies, and
          not accessible to DeAcademy staff — only enrollment and completion status sync back for reporting.
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
              Title
            </label>
            <input value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. New Employee Induction Program" className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
                Category
              </label>
              <select value={form.category} onChange={(e) => set({ category: e.target.value })} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
                {INTERNAL_CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
                Status
              </label>
              <select value={form.status} onChange={(e) => set({ status: e.target.value })} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
                <option value="draft">Draft (hidden from employees)</option>
                <option value="published">Published (assignable now)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
              Description
            </label>
            <textarea value={form.description} onChange={(e) => set({ description: e.target.value })} rows={3} placeholder="What is this training about?" className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
          </div>

          <ListEditor label="Learning Objectives" items={form.objectives} onChange={(objectives) => set({ objectives })} placeholder="e.g. Know who to contact in your first week" />

          <SyllabusEditor modules={form.syllabus} onChange={(syllabus) => set({ syllabus })} />
        </div>

        <button
          onClick={() => onSave({ ...form, id: initial?.id ?? `int-${Date.now()}` })}
          disabled={!canSubmit}
          className="sticky bottom-0 mt-6 flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium text-white disabled:opacity-40"
          style={{ backgroundColor: COLORS.primary }}
        >
          Save Internal Training
        </button>
      </div>
    </div>
  );
}

function ContentTypeToggle({ value, onChange }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange("video")}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium"
        style={{ backgroundColor: value === "video" ? COLORS.primary : COLORS.card, color: value === "video" ? "#fff" : COLORS.ink, border: `1px solid ${value === "video" ? COLORS.primary : COLORS.line}` }}
      >
        <Video size={13} /> Video
      </button>
      <button
        onClick={() => onChange("slides")}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium"
        style={{ backgroundColor: value === "slides" ? COLORS.primary : COLORS.card, color: value === "slides" ? "#fff" : COLORS.ink, border: `1px solid ${value === "slides" ? COLORS.primary : COLORS.line}` }}
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
            <div className="mt-2 space-y-2">
              {topics.map((topic, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md p-2" style={{ backgroundColor: COLORS.paper }}>
                  <span className="w-6 shrink-0 text-center text-[10px]" style={{ color: COLORS.ink60 }}>
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-xs" style={{ color: COLORS.ink }}>
                    {topic}
                  </span>
                  <div className="w-40 shrink-0">
                    <MockFilePicker label="Audio" accept="audio/*" filename={config.slideAudio?.[i]} onSelect={(name) => set({ slideAudio: { ...config.slideAudio, [i]: name } })} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InternalContentPanel({ training, onClose }) {
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
          Same player your employees already use for DeAcademy courses — <strong>Video</strong> plays one file per
          module; <strong>Slides + Audio</strong> turns each syllabus topic into a paginated, narrated slide.
        </p>

        {modules.length === 0 ? (
          <div className="mt-6 rounded-lg p-6 text-center text-sm" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink60 }}>
            Add modules and topics in the Syllabus editor first, then come back here to set each one's content type.
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
            <Check size={14} style={{ color: COLORS.sage }} /> Saved. Employees will see this the next time you publish and assign it.
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

function InternalTrainingsTab({ trainings, setTrainings }) {
  const [editing, setEditing] = useState(null);
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
        title="Internal Trainings"
        sub="Build and run your own private training programs on the DeAcademy platform — from induction to internal SOPs"
        right={
          <button onClick={openNew} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: COLORS.primary }}>
            <Plus size={13} /> Create Internal Training
          </button>
        }
      />

      <div className="mb-4 flex items-start gap-2.5 rounded-lg p-3 text-xs" style={{ backgroundColor: `${COLORS.violet}0F`, border: `1px solid ${COLORS.violet}30`, color: COLORS.ink }}>
        <Lock size={14} style={{ color: COLORS.violet }} className="mt-0.5 shrink-0" />
        <span>
          Internal trainings are private to {COMPANY.name} — they never appear in the public DeAcademy catalog, no
          other company can see or assign them, and DeAcademy staff can't view the content itself. Completions still
          count toward each employee's personal DeAcademy competency portfolio, exactly like any other training.
        </span>
      </div>

      <div className="space-y-3">
        {trainings.map((t) => (
          <div key={t.id} className="flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: COLORS.ink }}>
                  {t.title}
                </span>
                <Pill color={COLORS.violet}>Internal</Pill>
                <Pill color={t.status === "published" ? COLORS.sage : COLORS.ink60}>{t.status === "published" ? "Published" : "Draft"}</Pill>
              </div>
              <div className="mt-0.5 text-xs" style={{ color: COLORS.ink60 }}>
                {t.category}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink }} className="text-sm font-medium">
                  {t.completed}/{t.assigned}
                </div>
                <div className="text-[10px] uppercase tracking-wide" style={{ color: COLORS.ink60 }}>
                  Completed
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
        {trainings.length === 0 && (
          <div className="rounded-lg p-6 text-center text-sm" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink60 }}>
            No internal trainings yet — create your first one to get started.
          </div>
        )}
      </div>

      {showForm && <InternalTrainingFormPanel initial={editing} onClose={() => setShowForm(false)} onSave={handleSave} />}
      {contentTraining && <InternalContentPanel training={contentTraining} onClose={() => setContentTraining(null)} />}
    </div>
  );
}

// ---------------- Assign Training ----------------
function AssignTrainingTab({ internalTrainings }) {
  const [training, setTraining] = useState(CATALOG_OPTIONS[0]);
  const [selected, setSelected] = useState([]);
  const [deadline, setDeadline] = useState("");
  const [sent, setSent] = useState(false);
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  const toggle = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const departments = useMemo(() => ["All", ...Array.from(new Set(EMPLOYEES.map((e) => e.department)))], []);

  const filteredEmployees = useMemo(
    () =>
      EMPLOYEES.filter(
        (e) =>
          (deptFilter === "All" || e.department === deptFilter) &&
          (e.name.toLowerCase().includes(query.toLowerCase()) || e.employeeId.toLowerCase().includes(query.toLowerCase()))
      ),
    [query, deptFilter]
  );

  const toggleAll = () => setSelected((prev) => (prev.length === filteredEmployees.length ? [] : filteredEmployees.map((e) => e.id)));

  const historyFor = (emp) => emp.trainingHistory.find((h) => h.title === training);

  return (
    <div>
      <SectionHeader title="Assign Training" sub="Assign a training from the DeAcademy catalog to specific employees, with an optional deadline" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
            Training
          </label>
          <select value={training} onChange={(e) => setTraining(e.target.value)} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
            <optgroup label="DeAcademy Catalog">
              {CATALOG_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </optgroup>
            {internalTrainings.filter((t) => t.status === "published").length > 0 && (
              <optgroup label="Internal Trainings (Private)">
                {internalTrainings
                  .filter((t) => t.status === "published")
                  .map((t) => (
                    <option key={t.id} value={t.title}>
                      {t.title}
                    </option>
                  ))}
              </optgroup>
            )}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
            Completion Deadline (optional)
          </label>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1 w-full rounded-md p-2.5 text-sm outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-medium" style={{ color: COLORS.ink }}>
            Employees ({selected.length} selected)
          </label>
          <button onClick={toggleAll} className="text-xs font-medium" style={{ color: COLORS.primary }}>
            {selected.length === filteredEmployees.length && filteredEmployees.length > 0 ? "Deselect All" : "Select All Filtered"}
          </button>
        </div>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <div className="flex flex-1 items-center gap-1.5 rounded-md px-2.5 py-1.5" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <Search size={13} style={{ color: COLORS.ink60 }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or employee ID…" className="w-full bg-transparent text-xs outline-none" style={{ color: COLORS.ink }} />
          </div>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="rounded-md px-2.5 py-1.5 text-xs outline-none" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === "All" ? "All Departments" : d}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2 overflow-hidden rounded-lg" style={{ border: `1px solid ${COLORS.line}` }}>
          {filteredEmployees.map((e) => {
            const history = historyFor(e);
            return (
              <button
                key={e.id}
                onClick={() => toggle(e.id)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left"
                style={{ backgroundColor: COLORS.card, borderTop: `1px solid ${COLORS.line}` }}
              >
                {selected.includes(e.id) ? <CheckSquare size={15} style={{ color: COLORS.primary }} className="shrink-0" /> : <Square size={15} style={{ color: COLORS.ink60 }} className="shrink-0" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: COLORS.ink }}>
                      {e.name}
                    </span>
                    <span className="text-[11px]" style={{ fontFamily: "IBM Plex Mono, monospace", color: COLORS.ink60 }}>
                      {e.employeeId}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: COLORS.ink60 }}>
                    {e.department} · {e.position}
                  </div>
                </div>
                {history ? (
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: COLORS.violet, backgroundColor: `${COLORS.violet}14` }}>
                    Completed {history.date} · Refresher
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: COLORS.ink60, backgroundColor: COLORS.paper }}>
                    Not Started
                  </span>
                )}
              </button>
            );
          })}
          {filteredEmployees.length === 0 && (
            <div className="p-4 text-center text-xs" style={{ color: COLORS.ink60 }}>
              No employees match your search.
            </div>
          )}
        </div>
      </div>

      {sent && (
        <div className="mt-4 flex items-center gap-2 rounded-lg p-3 text-xs" style={{ backgroundColor: `${COLORS.sage}12`, border: `1px solid ${COLORS.sage}35`, color: COLORS.ink }}>
          <CheckSquare size={14} style={{ color: COLORS.sage }} /> "{training}" assigned to {selected.length} employee(s). They'll see it in "Upcoming Trainings" and get an enrollment notification.
        </div>
      )}

      <button
        onClick={() => setSent(true)}
        disabled={selected.length === 0}
        className="mt-4 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        style={{ backgroundColor: COLORS.primary }}
      >
        <Send size={14} /> Assign Training
      </button>
    </div>
  );
}

// ---------------- Certificates & CPD ----------------
function CertificatesTab() {
  const needsUpdate = CERTIFICATES.filter((c) => c.cpdStatus === "Behind").length;
  return (
    <div className="space-y-6">
      <SectionHeader title="Certificates & CPD" sub="Certificates earned by your employees, and who needs a CPD update" />

      {needsUpdate > 0 && (
        <div className="flex items-center gap-2 rounded-lg p-3 text-xs" style={{ backgroundColor: `${COLORS.amber}12`, border: `1px solid ${COLORS.amber}35`, color: COLORS.ink }}>
          <AlertTriangle size={14} style={{ color: COLORS.amber }} /> {needsUpdate} certificate(s) need a CPD update this cycle.
        </div>
      )}

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
            {CERTIFICATES.map((c, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${COLORS.line}`, backgroundColor: COLORS.card }}>
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
                      <Mail size={11} /> Remind
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const NAV = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutGrid },
  { key: "employees", label: "Employees", Icon: Users2 },
  { key: "internal", label: "Internal Trainings", Icon: GraduationCap },
  { key: "assign", label: "Assign Training", Icon: BookOpen },
  { key: "certificates", label: "Certificates & CPD", Icon: ClipboardCheck },
];

const CORP_REPORT_SECTIONS = [
  { key: "compliance", label: "Training Compliance Summary", desc: "On-time vs late completion, progress distribution" },
  { key: "cpd", label: "Employee CPD Status", desc: "Who's compliant, at risk, or non-compliant this cycle" },
  { key: "internal", label: "Internal Training Progress", desc: "Enrollment and completion for your private programs" },
  { key: "certificates", label: "Certificates Issued", desc: "All certificates earned by your employees" },
];

function ReportBuilderModal({ onClose }) {
  const [selectedSections, setSelectedSections] = useState(CORP_REPORT_SECTIONS.map((s) => s.key));
  const [period, setPeriod] = useState("This Quarter");
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
          Pick what to include — handy for a quick training compliance update to your management.
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
            {CORP_REPORT_SECTIONS.map((s) => (
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

export default function CorporateAdminPortal() {
  const [tab, setTab] = useState("dashboard");
  const [internalTrainings, setInternalTrainings] = useState(INTERNAL_TRAININGS_INITIAL);
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
              <Building2 size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: "Fraunces, serif" }} className="text-sm font-semibold text-white">
                {COMPANY.name}
              </div>
              <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                via DeAcademy
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
            <Users2 size={14} color="#fff" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-medium text-white">Ratna Wijayanti</div>
            <div className="truncate text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>
              HR & Learning Manager (PIC)
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 px-5 py-6 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs" style={{ color: COLORS.ink60 }}>
              Corporate Admin Portal
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
        {tab === "employees" && <EmployeesTab />}
        {tab === "internal" && <InternalTrainingsTab trainings={internalTrainings} setTrainings={setInternalTrainings} />}
        {tab === "assign" && <AssignTrainingTab internalTrainings={internalTrainings} />}
        {tab === "certificates" && <CertificatesTab />}
        {showReportBuilder && <ReportBuilderModal onClose={() => setShowReportBuilder(false)} />}
      </main>
    </div>
  );
}

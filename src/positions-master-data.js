// DeAcademy — Position Master Data (shared module, v3 2026-08-24)
// Generated from data/positions.json — the canonical seed. Regenerate rather than hand-edit.
// Runtime mirror of DATA-MODEL.md §1.1 (`positions`) and §9 (upsell targeting).

export const POSITION_CATEGORIES = ["Human Resources", "Executive & General Management", "Quality, Compliance & Risk", "Health, Safety & Environment", "Finance & Accounting", "Operations & Production", "Supply Chain & Procurement", "Sales & Marketing", "Information Technology", "Engineering & Technical", "Project Management", "Legal & Corporate Affairs", "Education & Professional Services", "Administration & Support", "Early Career"];

export const POSITIONS = [
  { id: "chief-human-resources-officer-chro", label: "Chief Human Resources Officer (CHRO)", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "hr-director", label: "HR Director", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "hr-manager", label: "HR Manager", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "hr-business-partner", label: "HR Business Partner", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "hr-generalist", label: "HR Generalist", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "hr-officer", label: "HR Officer", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "hr-staff", label: "HR Staff", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "people-operations-manager", label: "People Operations Manager", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "talent-acquisition-manager", label: "Talent Acquisition Manager", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "talent-acquisition-lead", label: "Talent Acquisition Lead", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "recruitment-specialist", label: "Recruitment Specialist", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "recruiter", label: "Recruiter", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "learning-development-manager", label: "Learning & Development Manager", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "learning-development-specialist", label: "Learning & Development Specialist", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "training-manager", label: "Training Manager", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "training-officer", label: "Training Officer", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "compensation-benefits-manager", label: "Compensation & Benefits Manager", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "organizational-development-manager", label: "Organizational Development Manager", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "industrial-relations-manager", label: "Industrial Relations Manager", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "employee-relations-officer", label: "Employee Relations Officer", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "hris-analyst", label: "HRIS Analyst", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "hr-consultant", label: "HR Consultant", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "freelance-hr-competency-consultant", label: "Freelance HR & Competency Consultant", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "competency-assessor", label: "Competency Assessor", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "assessment-center-officer", label: "Assessment Center Officer", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "owner-founder", label: "Owner / Founder", category: "Executive & General Management", hrFamily: false, active: true, system: true },
  { id: "chief-executive-officer-ceo", label: "Chief Executive Officer (CEO)", category: "Executive & General Management", hrFamily: false, active: true, system: true },
  { id: "chief-operating-officer-coo", label: "Chief Operating Officer (COO)", category: "Executive & General Management", hrFamily: false, active: true, system: true },
  { id: "managing-director", label: "Managing Director", category: "Executive & General Management", hrFamily: false, active: true, system: true },
  { id: "director", label: "Director", category: "Executive & General Management", hrFamily: false, active: true, system: true },
  { id: "general-manager", label: "General Manager", category: "Executive & General Management", hrFamily: false, active: true, system: true },
  { id: "branch-manager", label: "Branch Manager", category: "Executive & General Management", hrFamily: false, active: true, system: true },
  { id: "department-head", label: "Department Head", category: "Executive & General Management", hrFamily: false, active: true, system: true },
  { id: "business-unit-head", label: "Business Unit Head", category: "Executive & General Management", hrFamily: false, active: true, system: true },
  { id: "quality-assurance-manager", label: "Quality Assurance Manager", category: "Quality, Compliance & Risk", hrFamily: false, active: true, system: true },
  { id: "quality-control-manager", label: "Quality Control Manager", category: "Quality, Compliance & Risk", hrFamily: false, active: true, system: true },
  { id: "qa-officer", label: "QA Officer", category: "Quality, Compliance & Risk", hrFamily: false, active: true, system: true },
  { id: "qc-officer", label: "QC Officer", category: "Quality, Compliance & Risk", hrFamily: false, active: true, system: true },
  { id: "quality-management-system-qms-officer", label: "Quality Management System (QMS) Officer", category: "Quality, Compliance & Risk", hrFamily: false, active: true, system: true },
  { id: "internal-auditor", label: "Internal Auditor", category: "Quality, Compliance & Risk", hrFamily: false, active: true, system: true },
  { id: "lead-auditor", label: "Lead Auditor", category: "Quality, Compliance & Risk", hrFamily: false, active: true, system: true },
  { id: "compliance-manager", label: "Compliance Manager", category: "Quality, Compliance & Risk", hrFamily: false, active: true, system: true },
  { id: "compliance-officer", label: "Compliance Officer", category: "Quality, Compliance & Risk", hrFamily: false, active: true, system: true },
  { id: "risk-management-manager", label: "Risk Management Manager", category: "Quality, Compliance & Risk", hrFamily: false, active: true, system: true },
  { id: "risk-analyst", label: "Risk Analyst", category: "Quality, Compliance & Risk", hrFamily: false, active: true, system: true },
  { id: "hse-manager", label: "HSE Manager", category: "Health, Safety & Environment", hrFamily: false, active: true, system: true },
  { id: "hse-supervisor", label: "HSE Supervisor", category: "Health, Safety & Environment", hrFamily: false, active: true, system: true },
  { id: "hse-officer", label: "HSE Officer", category: "Health, Safety & Environment", hrFamily: false, active: true, system: true },
  { id: "safety-engineer", label: "Safety Engineer", category: "Health, Safety & Environment", hrFamily: false, active: true, system: true },
  { id: "environmental-officer", label: "Environmental Officer", category: "Health, Safety & Environment", hrFamily: false, active: true, system: true },
  { id: "occupational-health-officer", label: "Occupational Health Officer", category: "Health, Safety & Environment", hrFamily: false, active: true, system: true },
  { id: "chief-financial-officer-cfo", label: "Chief Financial Officer (CFO)", category: "Finance & Accounting", hrFamily: false, active: true, system: true },
  { id: "finance-director", label: "Finance Director", category: "Finance & Accounting", hrFamily: false, active: true, system: true },
  { id: "finance-manager", label: "Finance Manager", category: "Finance & Accounting", hrFamily: false, active: true, system: true },
  { id: "accounting-manager", label: "Accounting Manager", category: "Finance & Accounting", hrFamily: false, active: true, system: true },
  { id: "accountant", label: "Accountant", category: "Finance & Accounting", hrFamily: false, active: true, system: true },
  { id: "finance-staff", label: "Finance Staff", category: "Finance & Accounting", hrFamily: false, active: true, system: true },
  { id: "internal-audit-manager", label: "Internal Audit Manager", category: "Finance & Accounting", hrFamily: false, active: true, system: true },
  { id: "tax-manager", label: "Tax Manager", category: "Finance & Accounting", hrFamily: false, active: true, system: true },
  { id: "tax-officer", label: "Tax Officer", category: "Finance & Accounting", hrFamily: false, active: true, system: true },
  { id: "treasury-officer", label: "Treasury Officer", category: "Finance & Accounting", hrFamily: false, active: true, system: true },
  { id: "budget-planning-analyst", label: "Budget & Planning Analyst", category: "Finance & Accounting", hrFamily: false, active: true, system: true },
  { id: "operations-director", label: "Operations Director", category: "Operations & Production", hrFamily: false, active: true, system: true },
  { id: "operations-manager", label: "Operations Manager", category: "Operations & Production", hrFamily: false, active: true, system: true },
  { id: "plant-manager", label: "Plant Manager", category: "Operations & Production", hrFamily: false, active: true, system: true },
  { id: "production-manager", label: "Production Manager", category: "Operations & Production", hrFamily: false, active: true, system: true },
  { id: "production-supervisor", label: "Production Supervisor", category: "Operations & Production", hrFamily: false, active: true, system: true },
  { id: "production-staff", label: "Production Staff", category: "Operations & Production", hrFamily: false, active: true, system: true },
  { id: "maintenance-manager", label: "Maintenance Manager", category: "Operations & Production", hrFamily: false, active: true, system: true },
  { id: "maintenance-supervisor", label: "Maintenance Supervisor", category: "Operations & Production", hrFamily: false, active: true, system: true },
  { id: "facility-manager", label: "Facility Manager", category: "Operations & Production", hrFamily: false, active: true, system: true },
  { id: "service-delivery-manager", label: "Service Delivery Manager", category: "Operations & Production", hrFamily: false, active: true, system: true },
  { id: "supply-chain-manager", label: "Supply Chain Manager", category: "Supply Chain & Procurement", hrFamily: false, active: true, system: true },
  { id: "procurement-manager", label: "Procurement Manager", category: "Supply Chain & Procurement", hrFamily: false, active: true, system: true },
  { id: "purchasing-officer", label: "Purchasing Officer", category: "Supply Chain & Procurement", hrFamily: false, active: true, system: true },
  { id: "logistics-manager", label: "Logistics Manager", category: "Supply Chain & Procurement", hrFamily: false, active: true, system: true },
  { id: "warehouse-manager", label: "Warehouse Manager", category: "Supply Chain & Procurement", hrFamily: false, active: true, system: true },
  { id: "warehouse-supervisor", label: "Warehouse Supervisor", category: "Supply Chain & Procurement", hrFamily: false, active: true, system: true },
  { id: "inventory-controller", label: "Inventory Controller", category: "Supply Chain & Procurement", hrFamily: false, active: true, system: true },
  { id: "import-export-officer", label: "Import & Export Officer", category: "Supply Chain & Procurement", hrFamily: false, active: true, system: true },
  { id: "sales-director", label: "Sales Director", category: "Sales & Marketing", hrFamily: false, active: true, system: true },
  { id: "sales-manager", label: "Sales Manager", category: "Sales & Marketing", hrFamily: false, active: true, system: true },
  { id: "sales-supervisor", label: "Sales Supervisor", category: "Sales & Marketing", hrFamily: false, active: true, system: true },
  { id: "sales-executive", label: "Sales Executive", category: "Sales & Marketing", hrFamily: false, active: true, system: true },
  { id: "account-executive", label: "Account Executive", category: "Sales & Marketing", hrFamily: false, active: true, system: true },
  { id: "business-development-manager", label: "Business Development Manager", category: "Sales & Marketing", hrFamily: false, active: true, system: true },
  { id: "marketing-director", label: "Marketing Director", category: "Sales & Marketing", hrFamily: false, active: true, system: true },
  { id: "marketing-manager", label: "Marketing Manager", category: "Sales & Marketing", hrFamily: false, active: true, system: true },
  { id: "digital-marketing-specialist", label: "Digital Marketing Specialist", category: "Sales & Marketing", hrFamily: false, active: true, system: true },
  { id: "brand-manager", label: "Brand Manager", category: "Sales & Marketing", hrFamily: false, active: true, system: true },
  { id: "customer-service-manager", label: "Customer Service Manager", category: "Sales & Marketing", hrFamily: false, active: true, system: true },
  { id: "customer-service-officer", label: "Customer Service Officer", category: "Sales & Marketing", hrFamily: false, active: true, system: true },
  { id: "chief-information-officer-cio", label: "Chief Information Officer (CIO)", category: "Information Technology", hrFamily: false, active: true, system: true },
  { id: "it-director", label: "IT Director", category: "Information Technology", hrFamily: false, active: true, system: true },
  { id: "it-manager", label: "IT Manager", category: "Information Technology", hrFamily: false, active: true, system: true },
  { id: "it-support-officer", label: "IT Support Officer", category: "Information Technology", hrFamily: false, active: true, system: true },
  { id: "system-administrator", label: "System Administrator", category: "Information Technology", hrFamily: false, active: true, system: true },
  { id: "network-engineer", label: "Network Engineer", category: "Information Technology", hrFamily: false, active: true, system: true },
  { id: "software-engineer", label: "Software Engineer", category: "Information Technology", hrFamily: false, active: true, system: true },
  { id: "data-analyst", label: "Data Analyst", category: "Information Technology", hrFamily: false, active: true, system: true },
  { id: "data-scientist", label: "Data Scientist", category: "Information Technology", hrFamily: false, active: true, system: true },
  { id: "database-administrator", label: "Database Administrator", category: "Information Technology", hrFamily: false, active: true, system: true },
  { id: "it-security-compliance-lead", label: "IT Security & Compliance Lead", category: "Information Technology", hrFamily: false, active: true, system: true },
  { id: "information-security-officer", label: "Information Security Officer", category: "Information Technology", hrFamily: false, active: true, system: true },
  { id: "devops-engineer", label: "DevOps Engineer", category: "Information Technology", hrFamily: false, active: true, system: true },
  { id: "engineering-manager", label: "Engineering Manager", category: "Engineering & Technical", hrFamily: false, active: true, system: true },
  { id: "civil-engineer", label: "Civil Engineer", category: "Engineering & Technical", hrFamily: false, active: true, system: true },
  { id: "mechanical-engineer", label: "Mechanical Engineer", category: "Engineering & Technical", hrFamily: false, active: true, system: true },
  { id: "electrical-engineer", label: "Electrical Engineer", category: "Engineering & Technical", hrFamily: false, active: true, system: true },
  { id: "industrial-engineer", label: "Industrial Engineer", category: "Engineering & Technical", hrFamily: false, active: true, system: true },
  { id: "process-engineer", label: "Process Engineer", category: "Engineering & Technical", hrFamily: false, active: true, system: true },
  { id: "technician", label: "Technician", category: "Engineering & Technical", hrFamily: false, active: true, system: true },
  { id: "site-supervisor", label: "Site Supervisor", category: "Engineering & Technical", hrFamily: false, active: true, system: true },
  { id: "program-director", label: "Program Director", category: "Project Management", hrFamily: false, active: true, system: true },
  { id: "project-manager", label: "Project Manager", category: "Project Management", hrFamily: false, active: true, system: true },
  { id: "project-coordinator", label: "Project Coordinator", category: "Project Management", hrFamily: false, active: true, system: true },
  { id: "project-control-officer", label: "Project Control Officer", category: "Project Management", hrFamily: false, active: true, system: true },
  { id: "scrum-master", label: "Scrum Master", category: "Project Management", hrFamily: false, active: true, system: true },
  { id: "legal-manager", label: "Legal Manager", category: "Legal & Corporate Affairs", hrFamily: false, active: true, system: true },
  { id: "legal-officer", label: "Legal Officer", category: "Legal & Corporate Affairs", hrFamily: false, active: true, system: true },
  { id: "corporate-secretary", label: "Corporate Secretary", category: "Legal & Corporate Affairs", hrFamily: false, active: true, system: true },
  { id: "government-relations-officer", label: "Government Relations Officer", category: "Legal & Corporate Affairs", hrFamily: false, active: true, system: true },
  { id: "public-relations-manager", label: "Public Relations Manager", category: "Legal & Corporate Affairs", hrFamily: false, active: true, system: true },
  { id: "trainer-instructor", label: "Trainer / Instructor", category: "Education & Professional Services", hrFamily: false, active: true, system: true },
  { id: "senior-trainer", label: "Senior Trainer", category: "Education & Professional Services", hrFamily: false, active: true, system: true },
  { id: "lecturer-dosen", label: "Lecturer / Dosen", category: "Education & Professional Services", hrFamily: false, active: true, system: true },
  { id: "academic-coordinator", label: "Academic Coordinator", category: "Education & Professional Services", hrFamily: false, active: true, system: true },
  { id: "researcher", label: "Researcher", category: "Education & Professional Services", hrFamily: false, active: true, system: true },
  { id: "management-consultant", label: "Management Consultant", category: "Education & Professional Services", hrFamily: false, active: true, system: true },
  { id: "independent-consultant", label: "Independent Consultant", category: "Education & Professional Services", hrFamily: false, active: true, system: true },
  { id: "subject-matter-expert", label: "Subject Matter Expert", category: "Education & Professional Services", hrFamily: false, active: true, system: true },
  { id: "office-manager", label: "Office Manager", category: "Administration & Support", hrFamily: false, active: true, system: true },
  { id: "executive-assistant", label: "Executive Assistant", category: "Administration & Support", hrFamily: false, active: true, system: true },
  { id: "administrative-officer", label: "Administrative Officer", category: "Administration & Support", hrFamily: false, active: true, system: true },
  { id: "general-affairs-manager", label: "General Affairs Manager", category: "Administration & Support", hrFamily: false, active: true, system: true },
  { id: "general-affairs-officer", label: "General Affairs Officer", category: "Administration & Support", hrFamily: false, active: true, system: true },
  { id: "receptionist", label: "Receptionist", category: "Administration & Support", hrFamily: false, active: true, system: true },
  { id: "student", label: "Student", category: "Early Career", hrFamily: false, active: true, system: true },
  { id: "fresh-graduate", label: "Fresh Graduate", category: "Early Career", hrFamily: false, active: true, system: true },
  { id: "intern-apprentice", label: "Intern / Apprentice", category: "Early Career", hrFamily: false, active: true, system: true },
  { id: "hr-l-d-manager", label: "HR & L&D Manager", category: "Human Resources", hrFamily: true, active: true, system: true },
  { id: "platform-operations-lead", label: "Platform Operations Lead", category: "Operations & Production", hrFamily: false, active: true, system: true },
  { id: "senior-tutor-certified-examiner", label: "Senior Tutor & Certified Examiner", category: "Education & Professional Services", hrFamily: false, active: true, system: true },
  { id: "manager-general", label: "Manager (General)", category: "Administration & Support", hrFamily: false, active: true, system: true },
  { id: "supervisor-general", label: "Supervisor (General)", category: "Administration & Support", hrFamily: false, active: true, system: true },
  { id: "staff-general", label: "Staff (General)", category: "Administration & Support", hrFamily: false, active: true, system: true },
  { id: "head-of-academy", label: "Head of Academy", category: "Executive & General Management", hrFamily: false, active: true, system: true },
];

// Legacy free-text titles → generic master-data ids (one-time migration aid).
export const LEGACY_ALIASES = {"Manager": "manager-general", "Supervisor": "supervisor-general", "Staff": "staff-general"};

export function findPosition(labelOrId) {
  return (
    POSITIONS.find((p) => p.id === labelOrId || p.label === labelOrId) ||
    (LEGACY_ALIASES[labelOrId] ? POSITIONS.find((p) => p.id === LEGACY_ALIASES[labelOrId]) : null)
  );
}

export function isHrFamily(labelOrId) {
  const p = findPosition(labelOrId);
  return !!(p && p.hrFamily && p.active);
}

// Upsell targeting — contract of 2026-08-24. Server-side is authoritative
// (GET /me → upsells[]); this mirror exists for prototypes and tests.
// user: { org: string|null, position: labelOrId, roles: string[] }
export function upsellsFor(user, activeRole) {
  const roles = new Set(user.roles || []);
  const hasCompany = user.org != null;
  const hr = isHrFamily(user.position);
  const out = [];

  if (activeRole === "participant") {
    if (hasCompany && !roles.has("corporate_admin")) out.push("corporate-upsell");
    if (!hasCompany) out.push("agency-upsell");
  }

  const alreadyHasSearch = roles.has("verifier") || roles.has("operator");
  if ((hasCompany || hr) && !alreadyHasSearch) {
    if (activeRole === "participant" || activeRole === "corporate_admin") out.push("verifier-upsell");
  }

  if (activeRole === "verifier" && hasCompany && !roles.has("corporate_admin")) out.push("corporate-upsell");

  return out;
}

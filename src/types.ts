export type Role =
  | "Super Admin"
  | "Head Teacher"
  | "Teacher"
  | "Bursar"
  | "Parent"
  | "Student";

export type Gender = "Male" | "Female";
export type AttendanceStatus = "Present" | "Late" | "Excused" | "Absent";
export type PaymentMethod = "Cash" | "POS" | "Bank Transfer" | "Paystack" | "Flutterwave";
export type AppStage = "Application" | "Assessment" | "Approval" | "Admitted";

export interface DemoUser {
  id: string;
  name: string;
  role: Role;
  title: string;
  email: string;
  phone: string;
  username: string;
  initials: string;
  scope: string;
  accent: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  subject: string;
  className: string;
  phone: string;
}

export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  className: string;
  gender: Gender;
  dob: string;
  stateOfOrigin: string;
  lga: string;
  religion: string;
  bloodGroup: string;
  genotype: "AA" | "AS" | "SS";
  allergies: string;
  guardianName: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianEmail: string;
  emergencyContact: string;
  authorizedPickup: string;
  parentId: string;
  status: "Active" | "Suspended" | "Graduated";
  tone: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  className: string;
  date: string;
  status: AttendanceStatus;
}

export interface ScoreEntry {
  id: string;
  studentId: string;
  className: string;
  subject: string;
  firstCA: number;
  secondCA: number;
  assignment: number;
  project: number;
  exam: number;
  state: "Draft" | "Submitted" | "Approved";
}

export interface FeeItem {
  id: string;
  label: string;
  amount: number;
}

export interface Invoice {
  id: string;
  studentId: string;
  term: string;
  items: FeeItem[];
  amountDue: number;
  amountPaid: number;
  status: "Paid" | "Part Paid" | "Outstanding";
}

export interface Payment {
  id: string;
  receiptNo: string;
  studentId: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  bank: string;
  date: string;
  loggedBy: string;
}

export interface Application {
  id: string;
  applicantName: string;
  gender: Gender;
  dob: string;
  classApplied: string;
  guardianName: string;
  guardianPhone: string;
  stage: AppStage;
  date: string;
  score: number;
  notes: string;
}

export interface TimetableSlot {
  id: string;
  className: string;
  day: string;
  period: string;
  subject: string;
  teacher: string;
  room: string;
}

export interface Homework {
  id: string;
  className: string;
  subject: string;
  title: string;
  details: string;
  dueDate: string;
  postedBy: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: string;
  date: string;
  author: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  description: string;
}

export interface GradeBand {
  min: number;
  max: number;
  letter: string;
  remark: string;
}

export interface AppState {
  students: Student[];
  attendance: AttendanceRecord[];
  scores: ScoreEntry[];
  invoices: Invoice[];
  payments: Payment[];
  applications: Application[];
  homework: Homework[];
  announcements: Announcement[];
  theme: "light" | "dark";
}

export type View =
  | "dashboard"
  | "students"
  | "admissions"
  | "attendance"
  | "academics"
  | "finance"
  | "timetable"
  | "communication";
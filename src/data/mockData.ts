import type {
  Announcement,
  Application,
  AttendanceRecord,
  DemoUser,
  FeeItem,
  GradeBand,
  Homework,
  Invoice,
  Payment,
  PaymentMethod,
  SchoolEvent,
  ScoreEntry,
  Staff,
  Student,
  TimetableSlot,
} from "@/types";

export const SCHOOL = {
  name: "Brilliant Academy",
  tagline: "Nursery & Primary School",
  motto: "Knowledge, Character, Service",
  address: "12 Gwarinpa Estate Road, Abuja FCT",
  phone: "0803 456 7890",
  email: "info@brilliantacademy.ng",
  session: "2024/2025",
  term: "Second Term",
  creche: "Creche",
};

export const CLASSES = [
  "Creche",
  "Pre-Nursery",
  "Nursery 1",
  "Nursery 2",
  "Nursery 3",
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
];

export const NURSERY_CLASSES = CLASSES.slice(0, 5);
export const PRIMARY_CLASSES = CLASSES.slice(5);

export const NURSERY_SUBJECTS = [
  "Numeracy",
  "Literacy & Phonics",
  "Rhymes & Songs",
  "Colouring & Craft",
  "Health Habits",
  "Social Norms",
];

export const PRIMARY_SUBJECTS = [
  "Mathematics",
  "English Studies",
  "Basic Science & Technology",
  "National Values Education",
  "Nigerian Language",
  "Cultural & Creative Arts",
  "Computer Studies",
  "Agricultural Science",
];

export const TERMS = ["First Term", "Second Term", "Third Term"];
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const PERIODS = ["8:00 - 8:45", "8:45 - 9:30", "10:00 - 10:45", "10:45 - 11:30", "12:00 - 12:45"];

export const GRADE_BANDS: GradeBand[] = [
  { min: 70, max: 100, letter: "A", remark: "Distinction / Excellent" },
  { min: 60, max: 69, letter: "B", remark: "Credit / Very Good" },
  { min: 50, max: 59, letter: "C", remark: "Merit / Good" },
  { min: 40, max: 49, letter: "P", remark: "Pass / Fair" },
  { min: 0, max: 39, letter: "F", remark: "Fail / Needs Improvement" },
];

export const AFFECTIVE_DOMAINS = ["Punctuality", "Neatness", "Politeness", "Class Participation", "Honesty", "Leadership"];
export const PSYCHOMOTOR_DOMAINS = ["Handwriting", "Sports & Games", "Drawing & Craft", "Verbal Fluency"];

export const subjectsFor = (className: string): string[] =>
  NURSERY_CLASSES.includes(className) ? NURSERY_SUBJECTS : PRIMARY_SUBJECTS;

export const isNursery = (className: string): boolean => NURSERY_CLASSES.includes(className);

export const gradeOf = (total: number): GradeBand =>
  GRADE_BANDS.find((b) => total >= b.min && total <= b.max) ?? GRADE_BANDS[4];

export const gradeTone = (letter: string): string =>
  ({
    A: "bg-brand-emerald/15 text-brand-emerald border-brand-emerald/30",
    B: "bg-brand-navy-light/15 text-brand-navy-light border-brand-navy-light/30",
    C: "bg-brand-gold/15 text-brand-gold border-brand-gold/30",
    P: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    F: "bg-rose-500/15 text-rose-700 border-rose-500/30",
  })[letter] ?? "bg-muted text-muted-foreground border-border";

export const money = (n: number): string => "₦" + n.toLocaleString("en-NG");

export const DEMO_USERS: DemoUser[] = [
  {
    id: "u1",
    name: "Dr. Mrs. Folashade Adeleke",
    role: "Super Admin",
    title: "Proprietress",
    email: "proprietress@brilliantacademy.ng",
    phone: "0803 111 2233",
    username: "f.adeleke",
    initials: "FA",
    scope: "Full system control",
    accent: "from-brand-navy to-brand-navy-light",
  },
  {
    id: "u2",
    name: "Mr. Emmanuel Okonkwo",
    role: "Head Teacher",
    title: "Head Teacher",
    email: "head.teacher@brilliantacademy.ng",
    phone: "0805 222 3344",
    username: "e.okonkwo",
    initials: "EO",
    scope: "Academics & staff oversight",
    accent: "from-brand-emerald to-brand-emerald-light",
  },
  {
    id: "u3",
    name: "Mrs. Blessing Danjuma",
    role: "Teacher",
    title: "Primary 4 Class Teacher",
    email: "b.danjuma@brilliantacademy.ng",
    phone: "0806 333 4455",
    username: "b.danjuma",
    initials: "BD",
    scope: "Primary 4 register & grading",
    accent: "from-brand-gold to-brand-gold-light",
  },
  {
    id: "u4",
    name: "Mr. Tunde Bakare",
    role: "Bursar",
    title: "School Accountant",
    email: "bursar@brilliantacademy.ng",
    phone: "0807 444 5566",
    username: "t.bakare",
    initials: "TB",
    scope: "Fees, receipts & payments",
    accent: "from-emerald-700 to-emerald-500",
  },
  {
    id: "u5",
    name: "Engr. & Mrs. Ibrahim Yusuf",
    role: "Parent",
    title: "Parent / Guardian",
    email: "ibrahim.yusuf@mail.com",
    phone: "0809 555 6677",
    username: "ibrahim.yusuf",
    initials: "IY",
    scope: "2 children enrolled",
    accent: "from-indigo-700 to-indigo-500",
  },
  {
    id: "u6",
    name: "Amina Yusuf",
    role: "Student",
    title: "Primary 4 Pupil",
    email: "amina.y@brilliantacademy.ng",
    phone: "-",
    username: "amina.y",
    initials: "AY",
    scope: "My results & homework",
    accent: "from-fuchsia-600 to-pink-500",
  },
];

const GUARDIANS: Record<string, Pick<Student, "guardianName" | "guardianRelationship" | "guardianPhone" | "guardianEmail" | "emergencyContact" | "authorizedPickup">> = {
  "p-yusuf": {
    guardianName: "Engr. Ibrahim Yusuf",
    guardianRelationship: "Father",
    guardianPhone: "0809 555 6677",
    guardianEmail: "ibrahim.yusuf@mail.com",
    emergencyContact: "Mrs. Hauwa Yusuf - 0810 555 1122",
    authorizedPickup: "Mrs. Hauwa Yusuf (Mother) - passport ID: FCT-88421",
  },
  "p-adeyemi": {
    guardianName: "Mrs. Bukola Adeyemi",
    guardianRelationship: "Mother",
    guardianPhone: "0811 223 4455",
    guardianEmail: "bukola.adeyemi@mail.com",
    emergencyContact: "Mr. Segun Adeyemi - 0812 334 5566",
    authorizedPickup: "Mr. Segun Adeyemi (Father) - passport ID: LAG-44019",
  },
  "p-okafor": {
    guardianName: "Mr. Chukwuemeka Okafor",
    guardianRelationship: "Father",
    guardianPhone: "0813 445 6677",
    guardianEmail: "emeka.okafor@mail.com",
    emergencyContact: "Mrs. Ngozi Okafor - 0814 556 7788",
    authorizedPickup: "Mrs. Ngozi Okafor (Mother) - passport ID: IMO-11230",
  },
  "p-bello": {
    guardianName: "Alhaji Musa Bello",
    guardianRelationship: "Father",
    guardianPhone: "0815 667 8899",
    guardianEmail: "musa.bello@mail.com",
    emergencyContact: "Hajia Zainab Bello - 0816 778 9900",
    authorizedPickup: "Hajia Zainab Bello (Mother) - passport ID: KAN-77095",
  },
  "p-eze": {
    guardianName: "Mrs. Chioma Eze",
    guardianRelationship: "Mother",
    guardianPhone: "0817 889 0011",
    guardianEmail: "chioma.eze@mail.com",
    emergencyContact: "Mr. Kenneth Eze - 0818 990 1122",
    authorizedPickup: "Mr. Kenneth Eze (Father) - passport ID: ENU-33217",
  },
};

const STUDENT_ROWS: Array<[string, string, string, string, string, string, string, string, string, string]> = [
  ["s1", "BA/2020/NUR/014", "Amina", "Yusuf", "Primary 4", "Female", "Kogi", "Okene", "p-yusuf", "from-rose-500 to-orange-400"],
  ["s2", "BA/2022/NUR/061", "Abdulazeez", "Yusuf", "Nursery 2", "Male", "Kogi", "Okene", "p-yusuf", "from-sky-500 to-indigo-500"],
  ["s3", "BA/2021/NUR/032", "Oluwaseun", "Adeyemi", "Primary 3", "Male", "Ekiti", "Ado-Ekiti", "p-adeyemi", "from-emerald-500 to-teal-500"],
  ["s4", "BA/2022/NUR/058", "Temilade", "Adeyemi", "Nursery 3", "Female", "Ekiti", "Ado-Ekiti", "p-adeyemi", "from-fuchsia-500 to-purple-500"],
  ["s5", "BA/2019/PRI/007", "Chidera", "Okafor", "Primary 5", "Male", "Anambra", "Idemili", "p-okafor", "from-amber-500 to-orange-500"],
  ["s6", "BA/2020/PRI/021", "Nneka", "Okafor", "Primary 4", "Female", "Anambra", "Idemili", "p-okafor", "from-rose-400 to-pink-500"],
  ["s7", "BA/2018/PRI/003", "Abubakar", "Bello", "Primary 6", "Male", "Kano", "Nassarawa", "p-bello", "from-lime-500 to-emerald-500"],
  ["s8", "BA/2021/PRI/045", "Halima", "Bello", "Primary 2", "Female", "Kano", "Nassarawa", "p-bello", "from-cyan-500 to-blue-500"],
  ["s9", "BA/2023/NUR/078", "Kelechi", "Eze", "Nursery 1", "Male", "Enugu", "Nsukka", "p-eze", "from-violet-500 to-indigo-500"],
  ["s10", "BA/2020/PRI/019", "Ifeoma", "Eze", "Primary 4", "Female", "Enugu", "Nsukka", "p-eze", "from-orange-400 to-red-500"],
  ["s11", "BA/2021/PRI/034", "Yakubu", "Danjuma", "Primary 3", "Male", "Plateau", "Jos North", "p-bello", "from-teal-500 to-cyan-600"],
  ["s12", "BA/2019/PRI/011", "Zainab", "Idris", "Primary 5", "Female", "Niger", "Chanchaga", "p-yusuf", "from-pink-500 to-rose-500"],
  ["s13", "BA/2022/NUR/055", "Peter", "Obi", "Nursery 3", "Male", "Benue", "Makurdi", "p-okafor", "from-blue-500 to-sky-500"],
  ["s14", "BA/2023/CRN/003", "Grace", "Ohaka", "Pre-Nursery", "Female", "Imo", "Owerri", "p-eze", "from-purple-500 to-fuchsia-500"],
];

export const STUDENTS: Student[] = STUDENT_ROWS.map(
  ([id, admissionNo, firstName, lastName, className, gender, state, lga, parentId, tone]) => ({
    id,
    admissionNo,
    firstName,
    lastName,
    className,
    gender: gender as Student["gender"],
    dob: `${2015 + (id.charCodeAt(1) % 4)}-0${(id.charCodeAt(2) % 9) + 1}-1${id.charCodeAt(1) % 9}`,
    stateOfOrigin: state,
    lga,
    religion: "Christianity",
    bloodGroup: ["A+", "O+", "B+", "AB+"][id.charCodeAt(1) % 4],
    genotype: id.charCodeAt(1) % 6 === 0 ? "AS" : "AA",
    allergies: id === "s5" ? "Mild peanut allergy - no groundnut snacks" : "None reported",
    ...GUARDIANS[parentId],
    parentId,
    status: "Active",
    tone,
  }),
);

export const PARENT_CHILDREN = (parentId: string) => STUDENTS.filter((s) => s.parentId === parentId);

export const STAFF: Staff[] = [
  { id: "st1", name: "Mr. Emmanuel Okonkwo", role: "Head Teacher", subject: "Administration", className: "All", phone: "0805 222 3344" },
  { id: "st2", name: "Mrs. Blessing Danjuma", role: "Class Teacher", subject: "Mathematics", className: "Primary 4", phone: "0806 333 4455" },
  { id: "st3", name: "Mr. Kelechi Nwosu", role: "Class Teacher", subject: "English Studies", className: "Primary 5", phone: "0807 222 1188" },
  { id: "st4", name: "Miss Fatima Sani", role: "Class Teacher", subject: "Basic Science", className: "Primary 3", phone: "0808 555 3311" },
  { id: "st5", name: "Mrs. Adaeze Nnamdi", role: "Nursery Coordinator", subject: "Literacy & Phonics", className: "Nursery 2", phone: "0809 777 2244" },
  { id: "st6", name: "Mr. Tunde Bakare", role: "Bursar", subject: "Accounts", className: "All", phone: "0807 444 5566" },
];

export const FEE_STRUCTURE: FeeItem[] = [
  { id: "f1", label: "Tuition Fee", amount: 85000 },
  { id: "f2", label: "Feeding / Lunch Programme", amount: 32000 },
  { id: "f3", label: "School Uniform & Sportswear", amount: 18000 },
  { id: "f4", label: "School Bus Route", amount: 25000 },
  { id: "f5", label: "Books & ICT Levy", amount: 15000 },
];

const rnd = (seed: number): number => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const TODAY = new Date().toISOString().slice(0, 10);

export const ATTENDANCE: AttendanceRecord[] = STUDENTS.map((s, i) => {
  const r = rnd(i + 7);
  const status = r > 0.86 ? "Absent" : r > 0.74 ? "Late" : r > 0.68 ? "Excused" : "Present";
  return { id: `a-${s.id}-${TODAY}`, studentId: s.id, className: s.className, date: TODAY, status };
});

export const INITIAL_SCORES: ScoreEntry[] = STUDENTS.flatMap((s, si) =>
  subjectsFor(s.className).map((subject, sj) => {
    const firstCA = Math.round(4 + rnd(si * 13 + sj) * 6);
    const secondCA = Math.round(4 + rnd(si * 17 + sj) * 6);
    const assignment = Math.round(4 + rnd(si * 19 + sj) * 6);
    const project = Math.round(4 + rnd(si * 23 + sj) * 6);
    const exam = Math.round(28 + rnd(si * 29 + sj) * 32);
    return {
      id: `sc-${s.id}-${sj}`,
      studentId: s.id,
      className: s.className,
      subject,
      firstCA,
      secondCA,
      assignment,
      project,
      exam,
      state: si % 4 === 0 ? "Submitted" : "Draft",
    };
  }),
);

export const INVOICES: Invoice[] = STUDENTS.map((s, i) => {
  const items = FEE_STRUCTURE.filter((_, fi) => fi !== 3 || i % 2 === 0);
  const amountDue = items.reduce((t, it) => t + it.amount, 0);
  const ratio = [1, 0.6, 0.85, 1, 0.4, 0.25][i % 6];
  const amountPaid = Math.round(amountDue * ratio);
  return {
    id: `inv-${s.id}`,
    studentId: s.id,
    term: "Second Term 2024/2025",
    items,
    amountDue,
    amountPaid,
    status: amountPaid >= amountDue ? "Paid" : amountPaid > 0 ? "Part Paid" : "Outstanding",
  };
});

const METHODS: PaymentMethod[] = ["Bank Transfer", "POS", "Cash", "Paystack", "Flutterwave"];

export const PAYMENTS: Payment[] = INVOICES.filter((inv) => inv.amountPaid > 0).map((inv, i) => ({
  id: `pay-${inv.studentId}`,
  receiptNo: `BA-RCP-${2400 + i}`,
  studentId: inv.studentId,
  amount: inv.amountPaid,
  method: METHODS[i % METHODS.length],
  reference: `REF${100480 + i * 37}`,
  bank: ["GTBank", "Zenith Bank", "Access Bank", "UBA", "First Bank"][i % 5],
  date: `2025-01-${String(8 + (i % 18)).padStart(2, "0")}`,
  loggedBy: "Mr. Tunde Bakare",
}));

export const APPLICATIONS: Application[] = [
  { id: "ap1", applicantName: "Daniel Chukwuma", gender: "Male", dob: "2020-04-12", classApplied: "Nursery 1", guardianName: "Mrs. Uche Chukwuma", guardianPhone: "0812 111 9900", stage: "Application", date: "2025-01-06", score: 0, notes: "Walk-in enquiry at the front desk." },
  { id: "ap2", applicantName: "Maryam Suleiman", gender: "Female", dob: "2019-09-03", classApplied: "Nursery 3", guardianName: "Mr. Aliyu Suleiman", guardianPhone: "0813 222 8800", stage: "Assessment", date: "2025-01-08", score: 0, notes: "Assessment scheduled for Saturday." },
  { id: "ap3", applicantName: "Emeka Nwafor", gender: "Male", dob: "2017-06-21", classApplied: "Primary 2", guardianName: "Dr. Ngozi Nwafor", guardianPhone: "0814 333 7700", stage: "Assessment", date: "2025-01-09", score: 78, notes: "Strong numeracy result from transfer school." },
  { id: "ap4", applicantName: "Blessing Effiong", gender: "Female", dob: "2016-02-14", classApplied: "Primary 3", guardianName: "Pastor Sam Effiong", guardianPhone: "0815 444 6600", stage: "Approval", date: "2025-01-10", score: 84, notes: "Head Teacher review pending." },
  { id: "ap5", applicantName: "Ibrahim Sanusi", gender: "Male", dob: "2014-11-30", classApplied: "Primary 5", guardianName: "Alhaja Rukayat Sanusi", guardianPhone: "0816 555 5500", stage: "Admitted", date: "2025-01-03", score: 91, notes: "Admission No BA/2025/PRI/042 issued." },
];

export const TIMETABLE: TimetableSlot[] = (() => {
  const out: TimetableSlot[] = [];
  const rows: Array<[string, string, string, string]> = [
    ["Mathematics", "Mrs. Blessing Danjuma", "Block A - Room 4", "P4"],
    ["English Studies", "Mr. Kelechi Nwosu", "Block A - Room 4", "P4"],
    ["Basic Science & Technology", "Miss Fatima Sani", "Science Lab", "P4"],
    ["Nigerian Language", "Mrs. Adaeze Nnamdi", "Block A - Room 4", "P4"],
    ["Computer Studies", "Mr. Kelechi Nwosu", "ICT Centre", "P5"],
  ];
  DAYS.forEach((day, di) =>
    PERIODS.forEach((period, pi) => {
      const [subject, teacher, room] = rows[(di + pi) % rows.length];
      out.push({ id: `tt-${di}-${pi}`, className: "Primary 4", day, period, subject, teacher, room });
    }),
  );
  return out;
})();

export const HOMEWORK: Homework[] = [
  { id: "hw1", className: "Primary 4", subject: "Mathematics", title: "Long Division Worksheet", details: "Complete questions 1-20 on page 46 of the New Method Maths Book.", dueDate: "2025-01-17", postedBy: "Mrs. Blessing Danjuma" },
  { id: "hw2", className: "Primary 4", subject: "English Studies", title: "Essay: My Community", details: "Write a 150-word essay describing your community and its leaders.", dueDate: "2025-01-20", postedBy: "Mr. Kelechi Nwosu" },
  { id: "hw3", className: "Primary 4", subject: "Basic Science & Technology", title: "The Water Cycle Diagram", details: "Draw and label the water cycle in your project notebook.", dueDate: "2025-01-22", postedBy: "Miss Fatima Sani" },
  { id: "hw4", className: "Nursery 2", subject: "Literacy & Phonics", title: "Letter Sound 'Bb'", details: "Practice writing letter Bb and colour the bag picture.", dueDate: "2025-01-18", postedBy: "Mrs. Adaeze Nnamdi" },
];

export const ANNOUNCEMENTS: Announcement[] = [
  { id: "an1", title: "Second Term PTA Meeting", body: "All parents are invited to the termly PTA meeting in the school hall. Report cards for first half-term will be discussed.", audience: "All School", date: "2025-01-14", author: "Mr. Emmanuel Okonkwo" },
  { id: "an2", title: "Nursery 2 Parents - Feeding Menu Update", body: "The lunch menu now includes extra fruits. Please update allergy notes with the class teacher.", audience: "Nursery 2 Parents", date: "2025-01-12", author: "Mrs. Adaeze Nnamdi" },
  { id: "an3", title: "Inter-House Sports Rehearsal", body: "Staff only: house masters should submit the list of athletes before Friday closing.", audience: "Staff Only", date: "2025-01-11", author: "Mr. Tunde Bakare" },
  { id: "an4", title: "Continuous Assessment Test Week", body: "CA tests hold from 20th to 24th January. All score sheets must be submitted to the Head Teacher.", audience: "All School", date: "2025-01-09", author: "Mr. Emmanuel Okonkwo" },
];

export const EVENTS: SchoolEvent[] = [
  { id: "ev1", title: "PTA Meeting", date: "2025-01-25", type: "Meeting", description: "Termly parent-teacher association gathering." },
  { id: "ev2", title: "Continuous Assessment Tests", date: "2025-01-20", type: "Academic", description: "One week of CA tests for Primary 1 to 6." },
  { id: "ev3", title: "Inter-House Sports", date: "2025-02-07", type: "Sports", description: "Annual inter-house athletics at the school field." },
  { id: "ev4", title: "Mid-Term Break", date: "2025-02-14", type: "Holiday", description: "School closes for the mid-term break, resumes 24th February." },
  { id: "ev5", title: "Valedictory Service", date: "2025-03-28", type: "Ceremony", description: "End of term valedictory and prize giving day." },
];

export const subjectTotal = (s: ScoreEntry): number => s.firstCA + s.secondCA + s.assignment + s.project + s.exam;

export const positionInClass = (
  studentId: string,
  className: string,
  all: ScoreEntry[],
): { position: number; average: number; of: number } => {
  const ranked = Array.from(new Set(all.filter((s) => s.className === className).map((s) => s.studentId)))
    .map((id) => {
      const mine = all.filter((s) => s.studentId === id);
      const total = mine.reduce((t, s) => t + subjectTotal(s), 0);
      return { id, avg: mine.length ? total / mine.length : 0 };
    })
    .sort((a, b) => b.avg - a.avg);
  const idx = ranked.findIndex((r) => r.id === studentId);
  const me = ranked[idx];
  return { position: idx + 1, average: me ? Math.round(me.avg) : 0, of: ranked.length };
};

export { TODAY };
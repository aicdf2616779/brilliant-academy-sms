import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Certificate,
  CheckCircle,
  CurrencyNgn,
  Heartbeat,
  ListChecks,
  MagnifyingGlass,
  Phone,
  Plus,
  Printer,
  Student as StudentIcon,
  Trophy,
  Users,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import type { AppStage, Application, AttendanceRecord, DemoUser, Invoice, Payment, ScoreEntry, Student, View } from "@/types";
import { CLASSES, SCHOOL, gradeOf, gradeTone, money, positionInClass, subjectTotal } from "@/data/mockData";

const PANEL = "rounded-2xl border border-border bg-card shadow-sm";
const anim = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const STAGES: AppStage[] = ["Application", "Assessment", "Approval", "Admitted"];
const STATUS_TONE: Record<string, string> = {
  Present: "bg-emerald-600/15 text-emerald-700",
  Late: "bg-amber-500/15 text-amber-700",
  Excused: "bg-indigo-500/15 text-indigo-700",
  Absent: "bg-rose-600/15 text-rose-700",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[12.5px] font-semibold">{value || "-"}</p>
    </div>
  );
}

interface Props {
  user: DemoUser;
  students: Student[];
  invoices: Invoice[];
  payments: Payment[];
  attendance: AttendanceRecord[];
  scores: ScoreEntry[];
  applications: Application[];
  initialTab: "registry" | "admissions";
  onView: (v: View) => void;
  onAdmit: (app: Application) => void;
  onStage: (id: string, stage: AppStage) => void;
  onAddApplication: (a: Application) => void;
  onToast: (m: string) => void;
}

export default function StudentsModule({ students, invoices, payments, attendance, scores, applications, initialTab, onView, onAdmit, onStage, onAddApplication, onToast }: Props) {
  const [tab, setTab] = useState<"registry" | "admissions">(initialTab);
  const [q, setQ] = useState("");
  const [klass, setKlass] = useState("All classes");
  const [gender, setGender] = useState("All");
  const [status, setStatus] = useState("All");
  const [open, setOpen] = useState<Student | null>(null);

  const classOptions = useMemo(() => ["All classes", ...CLASSES.filter((c) => students.some((s) => s.className === c))], [students]);
  const genderOptions = useMemo(() => ["All", ...Array.from(new Set(students.map((s) => s.gender)))], [students]);
  const statusOptions = useMemo(() => ["All", ...Array.from(new Set(students.map((s) => s.status)))], [students]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return students.filter((s) => {
      if (klass !== "All classes" && s.className !== klass) return false;
      if (gender !== "All" && s.gender !== gender) return false;
      if (status !== "All" && s.status !== status) return false;
      if (!needle) return true;
      return `${s.firstName} ${s.lastName} ${s.admissionNo} ${s.guardianName} ${s.className}`.toLowerCase().includes(needle);
    });
  }, [students, q, klass, gender, status]);

  const balanceFor = (id: string) => {
    const inv = invoices.find((i) => i.studentId === id);
    return inv ? inv.amountDue - inv.amountPaid : 0;
  };
  const attendanceFor = (id: string) => attendance.find((a) => a.studentId === id)?.status ?? "Not marked";
  const averageFor = (id: string) => {
    const mine = scores.filter((s) => s.studentId === id);
    return mine.length ? Math.round(mine.reduce((t, s) => t + subjectTotal(s), 0) / mine.length) : 0;
  };

  const boys = students.filter((s) => s.gender === "Male").length;
  const families = new Set(students.map((s) => s.parentId)).size;

  return (
    <div className="space-y-5">
      <motion.div {...anim} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight">Students, Parents & Admissions</h1>
          <p className="text-[12.5px] text-muted-foreground">
            Pupil bio-data, guardianship and the enrolment pipeline for {SCHOOL.term}.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setTab("admissions");
              onToast("Admission pipeline opened - capture or advance an applicant to enrol a new pupil.");
            }}
            className="flex items-center gap-1.5 rounded-xl bg-brand-navy px-3.5 py-2 text-[12px] font-semibold text-white dark:bg-brand-navy-light"
          >
            <Plus size={15} weight="bold" /> New admission
          </button>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Enrolled pupils", value: String(students.length), sub: `${CLASSES.length} classes`, icon: StudentIcon, tone: "bg-brand-navy" },
          { label: "Boys / Girls", value: `${boys} / ${students.length - boys}`, sub: "Gender distribution", icon: Users, tone: "bg-indigo-600" },
          { label: "Linked families", value: String(families), sub: "Parent accounts", icon: Heartbeat, tone: "bg-fuchsia-600" },
          { label: "Pipeline", value: String(applications.filter((a) => a.stage !== "Admitted").length), sub: `${applications.length} applications`, icon: ListChecks, tone: "bg-brand-gold" },
        ].map((s) => (
          <motion.div key={s.label} {...anim} className={`${PANEL} p-4`}>
            <div className="flex items-center gap-2.5">
              <span className={`grid h-9 w-9 place-items-center rounded-xl text-white ${s.tone}`}>
                <s.icon size={17} weight="fill" />
              </span>
              <p className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
            </div>
            <p className="mt-3 text-[24px] font-extrabold leading-none">{s.value}</p>
            <p className="mt-1.5 text-[11.5px] text-muted-foreground">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-1.5 rounded-xl border border-border bg-card p-1.5">
        {(["registry", "admissions"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`relative flex-1 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${tab === t ? "text-white" : "text-muted-foreground hover:bg-muted"}`}>
            {tab === t && <motion.span layoutId="st-tab" className="absolute inset-0 rounded-lg bg-brand-navy dark:bg-brand-navy-light" />}
            <span className="relative z-10">{t === "registry" ? "Pupil Registry" : "Admission Pipeline"}</span>
          </button>
        ))}
      </div>

      {tab === "registry" ? (
        <>
          <div className={`${PANEL} flex flex-wrap items-center gap-2 p-3`}>
            <div className="flex min-w-[190px] flex-1 items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2">
              <MagnifyingGlass size={16} className="text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, admission number or guardian..."
                className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-muted-foreground"
              />
            </div>
            {[
              { value: klass, set: setKlass, options: classOptions },
              { value: gender, set: setGender, options: genderOptions },
              { value: status, set: setStatus, options: statusOptions },
            ].map((f, i) => (
              <select key={i} value={f.value} onChange={(e) => f.set(e.target.value)} className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-[12.5px] font-medium outline-none">
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ))}
            <span className="ml-auto text-[11.5px] font-semibold text-muted-foreground">
              {filtered.length} of {students.length} pupils
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className={`${PANEL} p-10 text-center`}>
              <WarningCircle size={30} className="mx-auto text-brand-gold" />
              <p className="mt-2 text-[14px] font-bold">No pupil matches your filters</p>
              <p className="mt-1 text-[12px] text-muted-foreground">Adjust the class, gender or status filter and try again.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((s) => (
                <motion.div key={s.id} {...anim} className={`${PANEL} p-4`}>
                  <div className="flex items-center gap-3">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${s.tone} text-[13px] font-bold text-white`}>
                      {s.firstName[0]}
                      {s.lastName[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-bold">
                        {s.firstName} {s.lastName}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {s.admissionNo} / {s.className}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${STATUS_TONE[attendanceFor(s.id)] ?? "bg-muted text-muted-foreground"}`}>{attendanceFor(s.id)}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Row label="Guardian" value={s.guardianName} />
                    <Row label="Fee balance" value={money(balanceFor(s.id))} />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setOpen(s)} className="flex-1 rounded-lg border border-border py-2 text-[11.5px] font-semibold transition hover:bg-muted">
                      View profile
                    </button>
                    <button onClick={() => onView("academics")} className="flex-1 rounded-lg bg-brand-emerald py-2 text-[11.5px] font-semibold text-white transition hover:opacity-90">
                      Report card
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="grid gap-3 lg:grid-cols-4">
          {STAGES.map((stage) => {
            const list = applications.filter((a) => a.stage === stage);
            return (
              <motion.div key={stage} {...anim} className={`${PANEL} p-3`}>
                <div className="flex items-center justify-between">
                  <p className="text-[12.5px] font-bold">{stage}</p>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10.5px] font-bold text-muted-foreground">{list.length}</span>
                </div>
                <div className="mt-2.5 space-y-2">
                  {list.length === 0 && <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-[11px] text-muted-foreground">No applicant at this stage</p>}
                  {list.map((a) => (
                    <div key={a.id} className="rounded-xl border border-border bg-muted/30 p-3">
                      <p className="text-[12.5px] font-semibold">{a.applicantName}</p>
                      <p className="text-[10.5px] text-muted-foreground">
                        {a.classApplied} / {a.gender} / {a.date}
                      </p>
                      <p className="mt-1 text-[10.5px] text-muted-foreground">Guardian: {a.guardianName}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${a.score >= 70 ? "bg-emerald-600/15 text-emerald-700" : "bg-brand-gold/15 text-brand-gold"}`}>Score {a.score}%</span>
                        {stage === "Admitted" ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                            <CheckCircle size={12} weight="fill" /> Enrolled
                          </span>
                        ) : (
                          <button
                            onClick={() => (stage === "Approval" ? onAdmit(a) : onStage(a.id, STAGES[STAGES.indexOf(stage) + 1]))}
                            className="rounded-md bg-brand-navy px-2 py-1 text-[10.5px] font-bold text-white dark:bg-brand-navy-light"
                          >
                            {stage === "Approval" ? "Admit pupil" : "Advance"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
          <div className="lg:col-span-4">
            <button
              onClick={() => {
                onAddApplication({
                  id: `apx${Date.now()}`,
                  applicantName: "New Walk-in Applicant",
                  gender: "Female",
                  dob: "2019-04-12",
                  classApplied: "Nursery 2",
                  guardianName: "Walk-in Guardian",
                  guardianPhone: "0803 000 0000",
                  stage: "Application",
                  date: new Date().toISOString().slice(0, 10),
                  score: 0,
                  notes: "Captured from the front desk walk-in form.",
                });
                onToast("New walk-in application added to the pipeline.");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card py-4 text-[12.5px] font-semibold text-muted-foreground transition hover:border-brand-emerald hover:text-brand-emerald"
            >
              <Plus size={16} weight="bold" /> Capture a new walk-in application
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
            >
              <div className="school-crest flex items-start justify-between gap-3 px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/15 text-[14px] font-bold">
                    {open.firstName[0]}
                    {open.lastName[0]}
                  </span>
                  <div>
                    <p className="text-[16px] font-bold">
                      {open.firstName} {open.lastName}
                    </p>
                    <p className="text-[11.5px] text-white/75">
                      {open.className} / {open.admissionNo} / {open.status}
                    </p>
                  </div>
                </div>
                <button onClick={() => setOpen(null)} className="text-white/80 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
                    <StudentIcon size={14} /> Bio-data
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    <Row label="Gender" value={open.gender} />
                    <Row label="Date of birth" value={open.dob} />
                    <Row label="State / LGA" value={`${open.stateOfOrigin} / ${open.lga}`} />
                    <Row label="Religion" value={open.religion} />
                    <Row label="Blood group" value={open.bloodGroup} />
                    <Row label="Genotype" value={open.genotype} />
                  </div>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
                    <Phone size={14} /> Guardian & emergency
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <Row label={open.guardianRelationship} value={open.guardianName} />
                    <Row label="Guardian phone" value={open.guardianPhone} />
                    <Row label="Guardian email" value={open.guardianEmail} />
                    <Row label="Emergency contact" value={open.emergencyContact} />
                    <Row label="Authorised pickup" value={open.authorizedPickup} />
                    <Row label="Allergies" value={open.allergies} />
                  </div>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
                    <Trophy size={14} /> Academic snapshot
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    <Row label="Average score" value={`${averageFor(open.id)}%`} />
                    <Row label="Class position" value={`${positionInClass(open.id, open.className, scores).position} of ${positionInClass(open.id, open.className, scores).of}`} />
                    <Row label="Outstanding fees" value={money(balanceFor(open.id))} />
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {scores
                      .filter((s) => s.studentId === open.id)
                      .slice(0, 3)
                      .map((s) => {
                        const total = subjectTotal(s);
                        return (
                          <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2">
                            <span className="flex-1 text-[12px] font-semibold">{s.subject}</span>
                            <span className="text-[11.5px] text-muted-foreground">{total}/100</span>
                            <span className={`rounded-md border px-2 py-0.5 text-[10.5px] font-bold ${gradeTone(gradeOf(total).letter)}`}>{gradeOf(total).letter}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                  <button onClick={() => onView("academics")} className="flex items-center gap-1.5 rounded-xl bg-brand-emerald px-3.5 py-2 text-[12px] font-semibold text-white">
                    <Certificate size={15} /> Open report card
                  </button>
                  <button onClick={() => onView("finance")} className="flex items-center gap-1.5 rounded-xl bg-brand-navy px-3.5 py-2 text-[12px] font-semibold text-white dark:bg-brand-navy-light">
                    <CurrencyNgn size={15} /> Fee ledger ({payments.filter((p) => p.studentId === open.id).length} payments)
                  </button>
                  <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-[12px] font-semibold">
                    <Printer size={15} /> Print profile
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
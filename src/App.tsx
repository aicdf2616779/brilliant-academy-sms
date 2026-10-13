import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarBlank,
  CalendarCheck,
  CaretRight,
  ChalkboardTeacher,
  CheckCircle,
  ClipboardText,
  CurrencyNgn,
  EnvelopeSimple,
  GraduationCap,
  LockKey,
  Megaphone,
  SignOut,
  Student as StudentIcon,
  Trophy,
  Users,
  Wallet,
  WarningCircle,
} from "@phosphor-icons/react";
import AdminDashboard from "@/components/AdminDashboard";
import Navbar, { NAV_ITEMS } from "@/components/Navbar";
import StudentsModule from "@/components/StudentsModule";
import AcademicsModule from "@/components/AcademicsModule";
import FinanceModule from "@/components/FinanceModule";
import type {
  Announcement,
  Application,
  AppStage,
  AttendanceRecord,
  DemoUser,
  Homework,
  Invoice,
  Payment,
  Role,
  SchoolEvent,
  ScoreEntry,
  Student,
  TimetableSlot,
  View,
} from "@/types";
import {
  ANNOUNCEMENTS,
  APPLICATIONS,
  ATTENDANCE,
  CLASSES,
  DAYS,
  DEMO_USERS,
  EVENTS,
  HOMEWORK,
  INITIAL_SCORES,
  INVOICES,
  PARENT_CHILDREN,
  PAYMENTS,
  PERIODS,
  SCHOOL,
  STAFF,
  STUDENTS,
  TIMETABLE,
  money,
  subjectsFor,
} from "@/data/mockData";

const KEY = "brilliant-academy-state-v1";
const TODAY = new Date().toISOString().slice(0, 10);
const PANEL = "rounded-2xl border border-border bg-card shadow-sm";
const anim = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const PASSWORD = "Brilliant@2025";

interface Persisted {
  theme: "light" | "dark";
  userId: string | null;
  students: Student[];
  invoices: Invoice[];
  payments: Payment[];
  attendance: AttendanceRecord[];
  scores: ScoreEntry[];
  applications: Application[];
  announcements: Announcement[];
  homework: Homework[];
}

const initial = (): Persisted => ({
  theme: "light",
  userId: null,
  students: STUDENTS,
  invoices: INVOICES,
  payments: PAYMENTS,
  attendance: ATTENDANCE,
  scores: INITIAL_SCORES,
  applications: APPLICATIONS,
  announcements: ANNOUNCEMENTS,
  homework: HOMEWORK,
});

const hat = (n: string) => ["from-emerald-500 to-teal-700", "from-amber-500 to-orange-700", "from-sky-500 to-indigo-700"][n.length % 3];

function LoginGate({ onSignIn }: { onSignIn: (u: DemoUser) => void }) {
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const attempt = () => {
    const q = contact.trim().toLowerCase();
    const found = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === q || u.phone.replace(/\s/g, "") === q.replace(/\s/g, "") || u.name.toLowerCase() === q || u.id.toLowerCase() === q,
    );
    if (!found) {
      setError("No account matches that email, phone number or username. Try a demo role below.");
      return;
    }
    if (password !== PASSWORD) {
      setError("Incorrect password. Every demo account uses the shared staff password.");
      return;
    }
    onSignIn(found);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="school-crest relative flex flex-col justify-between p-8 text-white lg:p-12">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
            <GraduationCap size={26} weight="fill" />
          </span>
          <div>
            <p className="text-[17px] font-extrabold tracking-tight">{SCHOOL.name}</p>
            <p className="text-[11.5px] text-white/75">{SCHOOL.tagline}</p>
          </div>
        </div>
        <div className="mt-10 max-w-lg">
          <h1 className="text-[30px] font-extrabold leading-tight tracking-tight sm:text-[36px]">
            One portal for the whole school community
          </h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-white/85">
            Built for Nigerian nursery and primary standards - continuous assessment, nine-point grading, terminal report cards, class registers and
            the bursary ledger all in one secure, role-based workspace.
          </p>
          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {[
              "Role-based access for staff, parents and pupils",
              "Continuous assessment and report cards",
              "Fee billing, receipts and outstanding balances",
              "Attendance registers and result approvals",
            ].map((x) => (
              <p key={x} className="flex items-start gap-2 rounded-xl bg-white/10 px-3 py-2 text-[12px] backdrop-blur">
                <CheckCircle size={15} weight="fill" className="mt-0.5 shrink-0 text-brand-gold" /> {x}
              </p>
            ))}
          </div>
        </div>
        <p className="mt-10 text-[11.5px] text-white/70">
          {SCHOOL.address} / {SCHOOL.phone}
        </p>
      </div>

      <div className="flex items-center justify-center bg-background p-6 lg:p-12">
        <div className="w-full max-w-md">
          <h2 className="text-[22px] font-extrabold tracking-tight">Sign in to your portal</h2>
          <p className="mt-1 text-[12.5px] text-muted-foreground">Use your email address, phone number or username.</p>

          <div className="mt-5 space-y-3">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Email, phone or username</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                <EnvelopeSimple size={16} className="text-muted-foreground" />
                <input value={contact} onChange={(e) => { setContact(e.target.value); setError(""); }} placeholder="adaeze.okafor@brilliantacademy.ng" className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground" />
              </div>
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Password</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                <LockKey size={16} className="text-muted-foreground" />
                <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground" />
              </div>
            </label>
            {error && (
              <p className="flex items-start gap-2 rounded-xl bg-rose-500/10 px-3 py-2 text-[11.5px] font-medium text-rose-600">
                <WarningCircle size={15} className="mt-0.5 shrink-0" /> {error}
              </p>
            )}
            <button onClick={attempt} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-emerald py-3 text-[13.5px] font-bold text-white transition hover:opacity-90">
              Sign in securely <ArrowRight size={16} />
            </button>
          </div>

          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Demo accounts (tap to fill)</p>
            <div className="mt-2 grid gap-2">
              {DEMO_USERS.slice(0, 6).map((u) => (
                <button
                  key={u.id}
                  onClick={() => { setContact(u.email); setPassword(PASSWORD); setError(""); }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2 text-left transition hover:border-brand-emerald/50"
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${u.accent} text-[10.5px] font-bold text-white`}>{u.initials}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-semibold">{u.role}</span>
                    <span className="block truncate text-[10.5px] text-muted-foreground">{u.email}</span>
                  </span>
                  <CaretRight size={14} className="shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Shared demo password: <span className="font-semibold text-brand-emerald">{PASSWORD}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PortalHome({
  user,
  kids,
  invoices,
  payments,
  attendance,
  scores,
  announcements,
  homework,
  onView,
}: {
  user: DemoUser;
  kids: Student[];
  invoices: Invoice[];
  payments: Payment[];
  attendance: AttendanceRecord[];
  scores: ScoreEntry[];
  announcements: Announcement[];
  homework: Homework[];
  onView: (v: View) => void;
}) {
  const balance = (id: string) => {
    const inv = invoices.find((i) => i.studentId === id);
    return inv ? inv.amountDue - inv.amountPaid : 0;
  };
  const rate = (id: string) => {
    const mine = attendance.filter((a) => a.studentId === id);
    return mine.length ? Math.round((mine.filter((a) => a.status === "Present" || a.status === "Late").length / mine.length) * 100) : 0;
  };
  const avg = (id: string) => {
    const mine = scores.filter((s) => s.studentId === id);
    return mine.length ? Math.round(mine.reduce((t, s) => t + (s.firstCA + s.secondCA + s.assignment + s.project + s.exam), 0) / mine.length) : 0;
  };

  return (
    <div className="space-y-5">
      <motion.div {...anim} className="school-crest rounded-2xl p-5 text-white">
        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-white/75">{user.role} portal / {SCHOOL.term} {SCHOOL.session}</p>
        <h1 className="mt-1 text-[24px] font-extrabold tracking-tight">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-[12.5px] text-white/85">
          {user.role === "Parent"
            ? `You are following ${kids.length} ${kids.length === 1 ? "ward" : "wards"} at ${SCHOOL.name}. Results, fees and notices are shown below.`
            : `Here is your result summary, attendance record and fee status for ${SCHOOL.term}.`}
        </p>
      </motion.div>

      {kids.length === 0 ? (
        <div className={`${PANEL} p-10 text-center`}>
          <WarningCircle size={28} className="mx-auto text-brand-gold" />
          <p className="mt-2 text-[13.5px] font-bold">No ward is linked to this account yet</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Please contact the school office so the registry can link your children.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {kids.map((k) => (
            <motion.div key={k.id} {...anim} className={`${PANEL} p-4`}>
              <div className="flex items-center gap-3">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${k.tone} text-[14px] font-bold text-white`}>
                  {k.firstName[0]}
                  {k.lastName[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold">
                    {k.firstName} {k.lastName}
                  </p>
                  <p className="truncate text-[11.5px] text-muted-foreground">
                    {k.className} / {k.admissionNo}
                  </p>
                </div>
                <span className="rounded-lg bg-muted px-2 py-1 text-[10.5px] font-bold text-muted-foreground">{rate(k.id)}% present</span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-muted/50 p-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Average</p>
                  <p className="text-[15px] font-extrabold">{avg(k.id)}%</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Fee balance</p>
                  <p className={`text-[15px] font-extrabold ${balance(k.id) > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600"}`}>{balance(k.id) > 0 ? money(balance(k.id)) : "Settled"}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Status</p>
                  <p className="text-[15px] font-extrabold">{k.status}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => onView("academics")} className="flex items-center gap-1.5 rounded-xl bg-brand-emerald px-3.5 py-2 text-[12px] font-semibold text-white">
                  <Trophy size={15} /> View report card
                </button>
                <button onClick={() => onView("finance")} className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-[12px] font-semibold transition hover:bg-muted">
                  <Wallet size={15} /> Fees & receipts
                </button>
                <button onClick={() => onView("communication")} className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-[12px] font-semibold transition hover:bg-muted">
                  <Megaphone size={15} /> Notices
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div {...anim} className={`${PANEL} p-4`}>
          <p className="flex items-center gap-1.5 text-[13px] font-bold">
            <Megaphone size={16} className="text-brand-gold" /> Latest school notices
          </p>
          <div className="mt-3 space-y-2">
            {announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-[12.5px] font-semibold">{a.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{a.body}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{a.date}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...anim} className={`${PANEL} p-4`}>
          <p className="flex items-center gap-1.5 text-[13px] font-bold">
            <ClipboardText size={16} className="text-brand-emerald" /> Homework due
          </p>
          <div className="mt-3 space-y-2">
            {homework.slice(0, 3).map((h) => (
              <div key={h.id} className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-[12.5px] font-semibold">{h.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {h.subject} / due {h.dueDate}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...anim} className={`${PANEL} p-4`}>
          <p className="flex items-center gap-1.5 text-[13px] font-bold">
            <CalendarBlank size={16} className="text-brand-navy dark:text-brand-navy-light" /> School calendar
          </p>
          <div className="mt-3 space-y-2">
            {EVENTS.slice(0, 3).map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                <span className="rounded-lg bg-brand-navy/10 px-2 py-1 text-[10px] font-bold text-brand-navy dark:text-brand-navy-light">{e.type}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold">{e.title}</span>
                  <span className="block text-[10.5px] text-muted-foreground">{e.date}</span>
                </span>
              </div>
            ))}
          </div>
          <button onClick={() => onView("timetable")} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-[12px] font-semibold">
            Open class timetable <CaretRight size={14} />
          </button>
        </motion.div>
      </div>

      <motion.div {...anim} className={`${PANEL} p-4`}>
        <p className="flex items-center gap-1.5 text-[13px] font-bold">
          <CurrencyNgn size={16} className="text-brand-emerald" /> Payment history
        </p>
        {payments.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-8 text-center text-[12px] text-muted-foreground">No payment has been recorded on this account yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {payments.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold">{p.receiptNo}</span>
                  <span className="block truncate text-[10.5px] text-muted-foreground">
                    {p.method} / {p.bank} / {p.date}
                  </span>
                </span>
                <span className="text-[12.5px] font-bold">{money(p.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function TimetableHomeView({
  user,
  students,
  timetable,
  homework,
  onAddHomework,
  onToast,
}: {
  user: DemoUser;
  students: Student[];
  timetable: TimetableSlot[];
  homework: Homework[];
  onAddHomework: (h: Homework) => void;
  onToast: (m: string) => void;
}) {
  const locked = user.role === "Teacher" && CLASSES.includes(user.scope);
  const options = useMemo(() => Array.from(new Set(timetable.map((t) => t.className))).filter((c) => students.some((s) => s.className === c)), [timetable, students]);
  const [klass, setKlass] = useState(() => (locked ? user.scope : (options[0] ?? CLASSES[0])));
  const [day, setDay] = useState(DAYS[0]);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [subject, setSubject] = useState(() => subjectsFor(locked ? user.scope : (options[0] ?? CLASSES[0]))[0]);
  const canPost = user.role !== "Parent" && user.role !== "Student";

  const slots = timetable.filter((t) => t.className === klass && t.day === day);
  const list = homework.filter((h) => h.className === klass);

  const post = () => {
    if (!title.trim()) {
      onToast("Give the homework a short title before dispatching it.");
      return;
    }
    onAddHomework({
      id: `hw-${Date.now()}`,
      className: klass,
      subject,
      title: title.trim(),
      details: details.trim() || "See the class teacher for the brief.",
      dueDate: TODAY,
      postedBy: user.name,
    });
    setTitle("");
    setDetails("");
    onToast(`Homework dispatched to ${klass} guardians and pupils.`);
  };

  return (
    <div className="space-y-5">
      <motion.div {...anim} className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight">Timetable & Homework</h1>
          <p className="text-[12.5px] text-muted-foreground">Weekly period allocation for {SCHOOL.term}, with homework dispatched to guardians.</p>
        </div>
        <select value={klass} disabled={locked} onChange={(e) => { setKlass(e.target.value); setSubject(subjectsFor(e.target.value)[0]); }} className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-[12.5px] font-semibold outline-none">
          {(locked ? [klass] : options).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </motion.div>

      <div className="flex gap-1.5 overflow-x-auto rounded-xl border border-border bg-card p-1.5">
        {DAYS.map((d) => (
          <button key={d} onClick={() => setDay(d)} className={`relative flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${day === d ? "text-white" : "text-muted-foreground hover:bg-muted"}`}>
            {day === d && <motion.span layoutId="tt-day" className="absolute inset-0 rounded-lg bg-brand-navy dark:bg-brand-navy-light" />}
            <span className="relative z-10">{d}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <motion.div {...anim} className={`${PANEL} p-4 xl:col-span-2`}>
          <p className="flex items-center gap-1.5 text-[13px] font-bold">
            <CalendarCheck size={16} className="text-brand-emerald" /> {day} periods / {klass}
          </p>
          <div className="mt-3 space-y-2">
            {slots.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-[12px] text-muted-foreground">No period is scheduled for this class on {day}.</p>
            ) : (
              PERIODS.map((p) => {
                const slot = slots.find((s) => s.period === p);
                return (
                  <div key={p} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${slot ? "border-border bg-muted/30" : "border-dashed border-border/60 bg-transparent"}`}>
                    <span className="w-[92px] shrink-0 rounded-lg bg-brand-navy/10 px-2 py-1 text-center text-[10.5px] font-bold text-brand-navy dark:text-brand-navy-light">{p}</span>
                    {slot ? (
                      <>
                        <span className="min-w-[130px] flex-1 text-[12.5px] font-semibold">{slot.subject}</span>
                        <span className="text-[11.5px] text-muted-foreground">{slot.teacher}</span>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground">{slot.room}</span>
                      </>
                    ) : (
                      <span className="text-[11.5px] text-muted-foreground">Break / assembly / free period</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        <motion.div {...anim} className={`${PANEL} p-4`}>
          <p className="flex items-center gap-1.5 text-[13px] font-bold">
            <ClipboardText size={16} className="text-brand-gold" /> Homework for {klass}
          </p>
          <div className="mt-3 space-y-2">
            {list.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-2 py-6 text-center text-[12px] text-muted-foreground">No homework has been posted for this class yet.</p>
            ) : (
              list.map((h) => (
                <div key={h.id} className="rounded-xl border border-border bg-muted/30 p-3">
                  <p className="text-[12.5px] font-semibold">{h.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {h.subject} / due {h.dueDate}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed">{h.details}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">Posted by {h.postedBy}</p>
                </div>
              ))
            )}
          </div>

          {canPost && (
            <div className="mt-4 space-y-2 rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">New homework</p>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-lg border border-border bg-card px-2.5 py-2 text-[12px] font-medium outline-none">
                {subjectsFor(klass).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Homework title" className="w-full rounded-lg border border-border bg-card px-2.5 py-2 text-[12px] outline-none" />
              <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} placeholder="Instructions for pupils and guardians" className="w-full rounded-lg border border-border bg-card px-2.5 py-2 text-[12px] outline-none" />
              <button onClick={post} className="w-full rounded-lg bg-brand-emerald py-2 text-[12px] font-semibold text-white">
                Dispatch homework
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function CommunicationView({
  user,
  announcements,
  events,
  onAddAnnouncement,
  onToast,
}: {
  user: DemoUser;
  announcements: Announcement[];
  events: SchoolEvent[];
  onAddAnnouncement: (a: Announcement) => void;
  onToast: (m: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [group, setGroup] = useState("");
  const [message, setMessage] = useState("");
  const canPost = user.role === "Super Admin" || user.role === "Head Teacher" || user.role === "Teacher";
  const groups = useMemo(() => Array.from(new Set(announcements.map((a) => a.audience))), [announcements]);
  const [audience, setAudience] = useState(() => groups[0] ?? "All");

  const publish = () => {
    if (!title.trim() || !body.trim()) {
      onToast("Add both a headline and the message body before publishing.");
      return;
    }
    onAddAnnouncement({ id: `an-${Date.now()}`, title: title.trim(), body: body.trim(), date: TODAY, audience, author: user.name });
    setTitle("");
    setBody("");
    onToast("Announcement published to the school notice board.");
  };

  return (
    <div className="space-y-5">
      <motion.div {...anim}>
        <h1 className="text-[22px] font-extrabold tracking-tight">Communication & School Calendar</h1>
        <p className="text-[12.5px] text-muted-foreground">Notices, circulars, the term calendar and direct messages to guardians and staff.</p>
      </motion.div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {canPost && (
            <motion.div {...anim} className={`${PANEL} p-4`}>
              <p className="flex items-center gap-1.5 text-[13px] font-bold">
                <Megaphone size={16} className="text-brand-gold" /> Publish an announcement
              </p>
              <div className="mt-3 space-y-2">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Headline (e.g. PTA meeting on Friday)" className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-[13px] outline-none" />
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Write the full message for parents and staff..." className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-[12.5px] outline-none" />
                <div className="flex flex-wrap items-center gap-2">
                  <select value={audience} onChange={(e) => setAudience(e.target.value)} className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-[12.5px] font-medium outline-none">
                    {groups.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <button onClick={publish} className="ml-auto flex items-center gap-1.5 rounded-xl bg-brand-emerald px-4 py-2 text-[12.5px] font-semibold text-white">
                    <Megaphone size={15} /> Publish
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div {...anim} className={`${PANEL} p-4`}>
            <p className="text-[13px] font-bold">Notice board</p>
            <div className="mt-3 space-y-2">
              {announcements.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-[12px] text-muted-foreground">No announcement has been published yet.</p>
              ) : (
                announcements.map((a) => (
                  <div key={a.id} className="rounded-xl border border-border bg-muted/30 p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[13px] font-bold">{a.title}</p>
                      <span className="rounded-md bg-brand-gold/15 px-2 py-0.5 text-[10px] font-bold text-brand-gold">{a.audience}</span>
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{a.body}</p>
                    <p className="mt-1.5 text-[10.5px] text-muted-foreground">
                      {a.date} / {SCHOOL.name}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.div {...anim} className={`${PANEL} p-4`}>
            <p className="flex items-center gap-1.5 text-[13px] font-bold">
              <CalendarBlank size={16} className="text-brand-navy dark:text-brand-navy-light" /> Term calendar
            </p>
            <div className="mt-3 space-y-2">
              {events.map((e) => (
                <div key={e.id} className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12.5px] font-semibold">{e.title}</p>
                    <span className="shrink-0 rounded-md bg-brand-navy/10 px-2 py-0.5 text-[10px] font-bold text-brand-navy dark:text-brand-navy-light">{e.type}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{e.date}</p>
                  <p className="mt-1 text-[11px] leading-relaxed">{e.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...anim} className={`${PANEL} p-4`}>
            <p className="flex items-center gap-1.5 text-[13px] font-bold">
              <Users size={16} className="text-brand-emerald" /> Message a group
            </p>
            <div className="mt-3 space-y-2">
              <select value={group || audiences[0]} onChange={(e) => setGroup(e.target.value)} className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-[12.5px] font-medium outline-none">
                {audiences.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Type a short message..." className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-[12.5px] outline-none" />
              <button
                onClick={() => {
                  if (!message.trim()) {
                    onToast("Type a message before sending.");
                    return;
                  }
                  onToast(`Message sent to ${group || audiences[0]} via portal and SMS alert.`);
                  setMessage("");
                }}
                className="w-full rounded-xl bg-brand-navy py-2.5 text-[12.5px] font-semibold text-white dark:bg-brand-navy-light"
              >
                Send message
              </button>
              <p className="text-[10.5px] text-muted-foreground">Messages reach guardians on the portal and by SMS alert to their registered phone number.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const audiences = ["All parents", "Primary parents", "Nursery parents", "All staff", "Class teachers"];

export default function App() {
  const [state, setState] = useState<Persisted>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Persisted;
        if (parsed && parsed.students && parsed.students.length) return parsed;
      }
    } catch {
      /* ignore unreadable cache */
    }
    return initial();
  });
  const [view, setView] = useState<View>("dashboard");
  const [flash, setFlash] = useState<string | null>(null);

  const user = useMemo(() => DEMO_USERS.find((u) => u.id === state.userId) ?? DEMO_USERS[0], [state.userId]);
  const patch = (p: Partial<Persisted>) => setState((s) => ({ ...s, ...p }));
  const toast = (m: string) => setFlash(m);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.theme === "dark");
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state]);

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), 3600);
    return () => window.clearTimeout(t);
  }, [flash]);

  useEffect(() => {
    const allowed = NAV_ITEMS.filter((i) => i.roles.includes(user.role)).map((i) => i.key);
    if (!allowed.includes(view as never)) setView("dashboard");
  }, [user.role, view]);

  const isFamily = user.role === "Parent" || user.role === "Student";
  const kids = useMemo(() => {
    if (user.role === "Parent") {
      const own = PARENT_CHILDREN(user.id);
      return own.length ? own : state.students.slice(0, 2);
    }
    if (user.role === "Student") {
      const mine = state.students.find((s) => user.name.includes(s.firstName) && user.name.includes(s.lastName)) ?? state.students[0];
      return mine ? [mine] : [];
    }
    return state.students;
  }, [user, state.students]);

  const ids = new Set(kids.map((s) => s.id));
  const scopeStudents = isFamily ? kids : state.students;
  const scopeInvoices = isFamily ? state.invoices.filter((i) => ids.has(i.studentId)) : state.invoices;
  const scopePayments = isFamily ? state.payments.filter((p) => ids.has(p.studentId)) : state.payments;
  const scopeAttendance = isFamily ? state.attendance.filter((a) => ids.has(a.studentId)) : state.attendance;
  const scopeScores = isFamily ? state.scores.filter((s) => ids.has(s.studentId)) : state.scores;

  const recordPayment = (p: Payment) =>
    patch({
      payments: [p, ...state.payments],
      invoices: state.invoices.map((inv) => {
        if (inv.studentId !== p.studentId || inv.status === "Paid") return inv;
        const paid = Math.min(inv.amountDue, inv.amountPaid + p.amount);
        return { ...inv, amountPaid: paid, status: paid >= inv.amountDue ? "Paid" : "Part Paid" };
      }),
    });

  const saveScores = (updated: ScoreEntry[]) =>
    patch({ scores: [...state.scores.filter((x) => !updated.some((u) => u.studentId === x.studentId && u.subject === x.subject)), ...updated] });

  const saveAttendance = (records: AttendanceRecord[]) =>
    patch({ attendance: [...state.attendance.filter((a) => !records.some((r) => r.date === a.date && r.className === a.className)), ...records] });

  const addApplication = (a: Application) => {
    patch({ applications: [a, ...state.applications] });
    toast(`Application for ${a.applicantName} logged in the enrolment pipeline.`);
  };

  const setStage = (id: string, stage: AppStage) => {
    patch({ applications: state.applications.map((a) => (a.id === id ? { ...a, stage } : a)) });
    toast(`Application moved to the ${stage} stage.`);
  };

  const admit = (app: Application) => {
    const template = state.students[0];
    if (!template) {
      toast("No pupil record template available to enrol this applicant.");
      return;
    }
    const created: Student = {
      ...template,
      id: `stu-${Date.now()}`,
      firstName: app.applicantName.split(" ")[0] ?? "New",
      lastName: app.applicantName.split(" ").slice(1).join(" ") || "Pupil",
      className: app.classApplied,
      admissionNo: `BA/${new Date().getFullYear()}/${String(state.students.length + 1).padStart(3, "0")}`,
      gender: app.gender,
      guardianName: app.guardianName,
      guardianPhone: app.guardianPhone,
      dob: app.dob,
      tone: hat(app.applicantName),
    };
    patch({
      students: [created, ...state.students],
      applications: state.applications.map((a) => (a.id === app.id ? { ...a, stage: "Admitted" } : a)),
    });
    toast(`${created.firstName} ${created.lastName} admitted into ${created.className}.`);
    setView("students");
  };

  const addAnnouncement = (a: Announcement) => patch({ announcements: [a, ...state.announcements] });
  const addHomework = (h: Homework) => patch({ homework: [h, ...state.homework] });

  if (!state.userId) return <LoginGate onSignIn={(u) => patch({ userId: u.id })} />;

  const content = (() => {
    switch (view) {
      case "students":
      case "admissions":
        return (
          <StudentsModule
            user={user}
            students={scopeStudents}
            invoices={scopeInvoices}
            payments={scopePayments}
            attendance={scopeAttendance}
            scores={scopeScores}
            applications={state.applications}
            initialTab={view === "admissions" ? "admissions" : "registry"}
            onView={(v) => setView(v)}
            onAdmit={admit}
            onStage={setStage}
            onAddApplication={addApplication}
            onToast={toast}
          />
        );
      case "attendance":
        return (
          <AcademicsModule
            user={user}
            students={scopeStudents}
            scores={scopeScores}
            attendance={scopeAttendance}
            initialTab="attendance"
            onSaveScores={saveScores}
            onSaveAttendance={saveAttendance}
            onToast={toast}
          />
        );
      case "academics":
        return (
          <AcademicsModule
            user={user}
            students={scopeStudents}
            scores={scopeScores}
            attendance={scopeAttendance}
            initialTab="academics"
            onSaveScores={saveScores}
            onSaveAttendance={saveAttendance}
            onToast={toast}
          />
        );
      case "finance":
        return <FinanceModule user={user} students={scopeStudents} invoices={scopeInvoices} payments={scopePayments} onRecordPayment={recordPayment} onToast={toast} />;
      case "timetable":
        return <TimetableHomeView user={user} students={scopeStudents} timetable={TIMETABLE} homework={state.homework} onAddHomework={addHomework} onToast={toast} />;
      case "communication":
        return <CommunicationView user={user} announcements={state.announcements} events={EVENTS} onAddAnnouncement={addAnnouncement} onToast={toast} />;
      default:
        return isFamily ? (
          <PortalHome
            user={user}
            kids={kids}
            invoices={scopeInvoices}
            payments={scopePayments}
            attendance={scopeAttendance}
            scores={scopeScores}
            announcements={state.announcements}
            homework={state.homework}
            onView={(v) => setView(v)}
          />
        ) : (
          <AdminDashboard
            user={user}
            students={state.students}
            staff={STAFF}
            invoices={state.invoices}
            payments={state.payments}
            attendance={state.attendance}
            applications={state.applications}
            scores={state.scores}
            onView={(v) => setView(v)}
          />
        );
    }
  })();

  const roleOptions: Role[] = ["Super Admin", "Head Teacher", "Teacher", "Bursar", "Parent", "Student"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        user={user}
        onUserChange={(u) => patch({ userId: u.id })}
        view={view}
        onView={(v) => setView(v)}
        theme={state.theme}
        onToggleTheme={() => patch({ theme: state.theme === "dark" ? "light" : "dark" })}
        students={state.students}
        staff={STAFF}
        payments={state.payments}
        announcements={state.announcements}
      />

      <main className="mx-auto max-w-[1500px] px-3 py-5 sm:px-5">{content}</main>

      <footer className="mx-auto max-w-[1500px] px-3 pb-10 sm:px-5">
        <div className={`${PANEL} flex flex-wrap items-center gap-3 p-4`}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-700 text-[11px] font-bold text-white">{user.initials}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold">{user.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user.role} / {user.scope} / {user.email}
            </p>
          </div>
          <span className="hidden items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-[10.5px] font-semibold text-muted-foreground sm:flex">
            <ChalkboardTeacher size={14} /> {SCHOOL.session}
          </span>
          <button
            onClick={() => {
              patch({ userId: null });
              setView("dashboard");
            }}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-[12px] font-semibold transition hover:bg-muted"
          >
            <SignOut size={15} /> Sign out
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <p>
            {SCHOOL.name} management system / {SCHOOL.address} / {SCHOOL.phone}
          </p>
          <p className="flex items-center gap-1.5">
            <StudentIcon size={13} /> {state.students.length} pupils / {STAFF.length} staff / {roleOptions.length} role profiles
          </p>
        </div>
      </footer>

      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-5 left-1/2 z-[60] w-[min(92vw,30rem)] -translate-x-1/2 rounded-2xl border border-border bg-card px-4 py-3 shadow-2xl"
          >
            <p className="flex items-start gap-2 text-[12.5px] font-medium">
              <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-brand-emerald" /> {flash}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
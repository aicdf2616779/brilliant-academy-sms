import { useMemo } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Buildings,
  Cake,
  CalendarBlank,
  CalendarCheck,
  CaretRight,
  ChalkboardTeacher,
  ChartLineUp,
  CheckCircle,
  CurrencyNgn,
  Megaphone,
  Receipt,
  Student,
  Users,
  Wallet,
  WarningCircle,
} from "@phosphor-icons/react";
import type { Application, AttendanceRecord, DemoUser, Invoice, Payment, ScoreEntry, Staff, Student as Pupil, SchoolEvent, View } from "@/types";
import { CLASSES, EVENTS, SCHOOL, money } from "@/data/mockData";

interface Props {
  user: DemoUser;
  students: Pupil[];
  staff: Staff[];
  invoices: Invoice[];
  payments: Payment[];
  attendance: AttendanceRecord[];
  applications: Application[];
  scores: ScoreEntry[];
  onView: (v: View) => void;
}

const PANEL = "rounded-2xl border border-border bg-card shadow-sm";
const cardAnim = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } };

function Stat({ icon: Icon, label, value, sub, tone }: { icon: typeof Users; label: string; value: string; sub: string; tone: string }) {
  return (
    <motion.div {...cardAnim} transition={{ duration: 0.32 }} className={`${PANEL} relative overflow-hidden p-4`}>
      <span className={`absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 ${tone}`} />
      <div className="flex items-center gap-2.5">
        <span className={`grid h-9 w-9 place-items-center rounded-xl text-white ${tone}`}>
          <Icon size={18} weight="fill" />
        </span>
        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 text-[26px] font-extrabold leading-none tracking-tight">{value}</p>
      <p className="mt-1.5 text-[11.5px] text-muted-foreground">{sub}</p>
    </motion.div>
  );
}

export default function AdminDashboard({ user, students, staff, invoices, payments, attendance, applications, scores, onView }: Props) {
  const totals = useMemo(() => {
    const collected = payments.reduce((t, p) => t + p.amount, 0);
    const billed = invoices.reduce((t, i) => t + i.amountDue, 0);
    const parents = new Set(students.map((s) => s.parentId)).size;
    const teachers = staff.filter((s) => /Teacher|Coordinator|Head/i.test(s.role)).length;
    return {
      collected,
      billed,
      outstanding: billed - collected,
      parents,
      teachers,
      present: attendance.filter((a) => a.status === "Present").length,
      late: attendance.filter((a) => a.status === "Late").length,
      excused: attendance.filter((a) => a.status === "Excused").length,
      absent: attendance.filter((a) => a.status === "Absent").length,
      draft: scores.filter((s) => s.state === "Submitted").length,
    };
  }, [students, staff, invoices, payments, attendance, scores]);

  const enrollment = useMemo(
    () => CLASSES.map((c) => ({ name: c.replace("Primary ", "P").replace("Nursery ", "N"), full: c, pupils: students.filter((s) => s.className === c).length })),
    [students],
  );

  const attendanceMix = [
    { name: "Present", value: totals.present, fill: "#047857" },
    { name: "Late", value: totals.late, fill: "#d97706" },
    { name: "Excused", value: totals.excused, fill: "#6366f1" },
    { name: "Absent", value: totals.absent, fill: "#e11d48" },
  ];

  const trend = useMemo(() => {
    const base = Math.max(totals.collected / 4, 180000);
    return ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"].map((m, i) => ({
      month: m,
      collected: Math.round(base * (0.72 + Math.sin(i * 1.3) * 0.18 + i * 0.06)),
      target: Math.round(base * 1.05),
    }));
  }, [totals.collected]);

  const rate = attendance.length ? Math.round(((totals.present + totals.late) / attendance.length) * 100) : 0;
  const collectRate = totals.billed ? Math.round((totals.collected / totals.billed) * 100) : 0;

  return (
    <div className="space-y-5">
      <motion.div {...cardAnim} className="school-crest relative overflow-hidden rounded-2xl p-6 text-white">
        <div className="brand-grid absolute inset-0 opacity-25" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium text-white/70">
              {SCHOOL.session} / {SCHOOL.term} / {new Date().toDateString()}
            </p>
            <h1 className="mt-1 text-[25px] font-extrabold tracking-tight">Welcome back, {user.name.split(" ")[0]}</h1>
            <p className="mt-1 max-w-2xl text-[13px] text-white/80">
              {user.role} workspace - monitoring {students.length} pupils across {CLASSES.length} classes today.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onView("attendance")} className="rounded-xl bg-white/15 px-3.5 py-2 text-[12px] font-semibold backdrop-blur transition hover:bg-white/25">
              Mark attendance
            </button>
            <button onClick={() => onView("admissions")} className="rounded-xl bg-white px-3.5 py-2 text-[12px] font-bold text-brand-navy transition hover:bg-white/90">
              New admission
            </button>
          </div>
        </div>
      </motion.div>

      {totals.absent > 0 && (
        <motion.div {...cardAnim} className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-gold/35 bg-brand-gold/10 p-4">
          <WarningCircle size={20} className="text-brand-gold" weight="fill" />
          <p className="flex-1 text-[12.5px] font-medium">
            <span className="font-bold">{totals.absent} pupil{totals.absent === 1 ? "" : "s"}</span> absent today and {totals.excused} excused. Overall attendance rate is {rate}%.
          </p>
          <button onClick={() => onView("attendance")} className="rounded-lg bg-brand-gold px-3 py-1.5 text-[11.5px] font-bold text-white">
            Review register
          </button>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Student} label="Total Students" value={String(students.length)} sub={`${CLASSES.length} classes / ${totals.parents} families`} tone="bg-brand-navy" />
        <Stat icon={ChalkboardTeacher} label="Teaching Staff" value={String(totals.teachers)} sub={`${staff.length} staff on payroll`} tone="bg-indigo-600" />
        <Stat icon={CheckCircle} label="Present Today" value={String(totals.present + totals.late)} sub={`${rate}% attendance rate`} tone="bg-brand-emerald" />
        <Stat icon={WarningCircle} label="Absent Today" value={String(totals.absent)} sub={`${totals.excused} excused / ${totals.late} late`} tone="bg-rose-600" />
        <Stat icon={CurrencyNgn} label="Fees Collected" value={money(totals.collected)} sub={`${collectRate}% of ${money(totals.billed)} billed`} tone="bg-emerald-700" />
        <Stat icon={Receipt} label="Outstanding Balance" value={money(totals.outstanding)} sub="Across all class levels" tone="bg-brand-gold" />
        <Stat icon={Buildings} label="Pending Admissions" value={String(applications.filter((a) => a.stage !== "Admitted").length)} sub={`${applications.length} applications this term`} tone="bg-sky-600" />
        <Stat icon={Users} label="Parents / Guardians" value={String(totals.parents)} sub={`${totals.draft} CA sheets submitted`} tone="bg-fuchsia-600" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div {...cardAnim} className={`${PANEL} p-5 lg:col-span-2`}>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[14px] font-bold">
              <ChartLineUp size={17} className="text-brand-emerald" /> Fee collection trend
            </h2>
            <span className="rounded-lg bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">Last 6 months</span>
          </div>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ left: -18, right: 6, top: 6 }}>
                <defs>
                  <linearGradient id="colFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#047857" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#047857" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
                <YAxis tick={{ fontSize: 10 }} stroke="currentColor" opacity={0.5} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
                <Tooltip formatter={(v) => money(Number(v))} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="target" stroke="#d97706" strokeDasharray="4 4" fill="none" />
                <Area type="monotone" dataKey="collected" stroke="#047857" strokeWidth={2.5} fill="url(#colFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div {...cardAnim} className={`${PANEL} p-5`}>
          <h2 className="flex items-center gap-2 text-[14px] font-bold">
            <CalendarCheck size={17} className="text-brand-emerald" /> Today attendance mix
          </h2>
          <div className="mt-2 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attendanceMix} dataKey="value" nameKey="name" innerRadius={44} outerRadius={66} paddingAngle={3}>
                  {attendanceMix.map((a) => (
                    <Cell key={a.name} fill={a.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5">
            {attendanceMix.map((a) => (
              <div key={a.name} className="flex items-center gap-2 text-[11.5px]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: a.fill }} />
                <span className="flex-1 text-muted-foreground">{a.name}</span>
                <span className="font-bold">{a.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div {...cardAnim} className={`${PANEL} p-5 lg:col-span-2`}>
          <h2 className="flex items-center gap-2 text-[14px] font-bold">
            <Users size={17} className="text-brand-navy" /> Enrollment by class level
          </h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollment} margin={{ left: -22, right: 6, top: 6 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="currentColor" opacity={0.5} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} labelFormatter={(l) => enrollment.find((e) => e.name === l)?.full ?? l} />
                <Bar dataKey="pupils" radius={[6, 6, 0, 0]}>
                  {enrollment.map((e) => (
                    <Cell key={e.name} fill={e.name.startsWith("P") ? "#047857" : "#0a192f"} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div {...cardAnim} className={`${PANEL} p-5`}>
          <h2 className="flex items-center gap-2 text-[14px] font-bold">
            <Cake size={17} className="text-fuchsia-600" /> Quick actions
          </h2>
          <div className="mt-3 grid gap-2">
            {[
              { label: "Register new pupil", view: "admissions" as View, icon: Buildings },
              { label: "Record fee payment", view: "finance" as View, icon: CurrencyNgn },
              { label: "Enter CA scores", view: "academics" as View, icon: ChalkboardTeacher },
              { label: "Broadcast announcement", view: "communication" as View, icon: Megaphone },
            ].map((a) => (
              <button
                key={a.label}
                onClick={() => onView(a.view)}
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-left transition hover:border-brand-emerald/40 hover:bg-muted"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-emerald/10 text-brand-emerald">
                  <a.icon size={16} />
                </span>
                <span className="flex-1 text-[12.5px] font-semibold">{a.label}</span>
                <CaretRight size={14} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div {...cardAnim} className={`${PANEL} p-5`}>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[14px] font-bold">
              <Receipt size={17} className="text-brand-emerald" /> Recent fee payments
            </h2>
            <button onClick={() => onView("finance")} className="text-[11.5px] font-semibold text-brand-emerald">
              View ledger
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {[...payments].reverse().slice(0, 5).map((p) => {
              const s = students.find((x) => x.id === p.studentId);
              return (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-600/15 text-emerald-700">
                    <Wallet size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold">{s ? `${s.firstName} ${s.lastName}` : p.receiptNo}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {p.receiptNo} / {p.method} / {p.date}
                    </p>
                  </div>
                  <p className="shrink-0 text-[12.5px] font-bold text-brand-emerald">{money(p.amount)}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div {...cardAnim} className={`${PANEL} p-5`}>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[14px] font-bold">
              <CalendarBlank size={17} className="text-brand-gold" /> School calendar
            </h2>
            <button onClick={() => onView("communication")} className="text-[11.5px] font-semibold text-brand-emerald">
              Full calendar
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {(EVENTS as SchoolEvent[]).slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-gold/15 text-brand-gold">
                  <CalendarCheck size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold">{e.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{e.description}</p>
                </div>
                <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground">{e.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
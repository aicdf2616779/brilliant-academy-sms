import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  CaretRight,
  Certificate,
  ChalkboardTeacher,
  CheckCircle,
  FloppyDisk,
  MagnifyingGlass,
  Notebook,
  PaperPlaneTilt,
  Printer,
  Trophy,
  WarningCircle,
} from "@phosphor-icons/react";
import type { AttendanceRecord, AttendanceStatus, DemoUser, ScoreEntry, Student } from "@/types";
import { AFFECTIVE_DOMAINS, CLASSES, PSYCHOMOTOR_DOMAINS, SCHOOL, TERMS, gradeOf, gradeTone, isNursery, positionInClass, subjectsFor, subjectTotal } from "@/data/mockData";

const TODAY = new Date().toISOString().slice(0, 10);

const PANEL = "rounded-2xl border border-border bg-card shadow-sm";
const anim = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const STATUSES: AttendanceStatus[] = ["Present", "Late", "Excused", "Absent"];
const STATUS_TONE: Record<AttendanceStatus, string> = {
  Present: "bg-emerald-600 text-white",
  Late: "bg-amber-500 text-white",
  Excused: "bg-indigo-500 text-white",
  Absent: "bg-rose-600 text-white",
};

type Marks = { firstCA: number; secondCA: number; assignment: number; project: number; exam: number };
const ZERO: Marks = { firstCA: 0, secondCA: 0, assignment: 0, project: 0, exam: 0 };
const FIELDS: { key: keyof Marks; label: string; max: number }[] = [
  { key: "firstCA", label: "1st CA", max: 10 },
  { key: "secondCA", label: "2nd CA", max: 10 },
  { key: "assignment", label: "Assg.", max: 10 },
  { key: "project", label: "Proj.", max: 10 },
  { key: "exam", label: "Exam", max: 60 },
];
const rating = (n: number) => ["Excellent", "Very Good", "Good", "Fair"][Math.abs(n) % 4];
const remarkFor = (avg: number) =>
  avg >= 80
    ? "An outstanding result. Keep up the excellent conduct and steady study habits."
    : avg >= 70
      ? "A very good performance. A little more effort in the weaker subjects will lift the average."
      : avg >= 60
        ? "A good result. Consistent revision at home will improve the weaker areas."
        : "Fair performance. Closer attention to homework and revision is strongly advised.";

interface Props {
  user: DemoUser;
  students: Student[];
  scores: ScoreEntry[];
  attendance: AttendanceRecord[];
  initialTab: "academics" | "attendance";
  onSaveScores: (updated: ScoreEntry[]) => void;
  onSaveAttendance: (updated: AttendanceRecord[]) => void;
  onToast: (m: string) => void;
}

export default function AcademicsModule({ user, students, scores, attendance, initialTab, onSaveScores, onSaveAttendance, onToast }: Props) {
  const available = useMemo(() => CLASSES.filter((c) => students.some((s) => s.className === c)), [students]);
  const locked = user.role === "Teacher" && CLASSES.includes(user.scope);
  const [klass, setKlass] = useState(() => (locked ? user.scope : (available[0] ?? CLASSES[0])));
  const [tab, setTab] = useState<"academics" | "attendance">(initialTab);
  const [subject, setSubject] = useState(() => subjectsFor(locked ? user.scope : (available[0] ?? CLASSES[0]))[0]);
  const [term, setTerm] = useState(TERMS[1]);
  const [draft, setDraft] = useState<Record<string, Marks>>({});
  const [pupilId, setPupilId] = useState("");
  const [dayDraft, setDayDraft] = useState<Record<string, AttendanceStatus>>({});
  const [date, setDate] = useState(TODAY);
  const [q, setQ] = useState("");

  const subjects = subjectsFor(klass);
  const roster = useMemo(() => students.filter((s) => s.className === klass), [students, klass]);
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return n ? roster.filter((s) => `${s.firstName} ${s.lastName} ${s.admissionNo}`.toLowerCase().includes(n)) : roster;
  }, [roster, q]);

  const baseMarks = (id: string): Marks => {
    const rec = scores.find((s) => s.studentId === id && s.subject === subject);
    return rec ? { firstCA: rec.firstCA, secondCA: rec.secondCA, assignment: rec.assignment, project: rec.project, exam: rec.exam } : ZERO;
  };
  const marksOf = (id: string): Marks => draft[id] ?? baseMarks(id);
  const setMark = (id: string, key: keyof Marks, raw: string, max: number) => {
    const safe = Math.max(0, Math.min(max, Number(raw) || 0));
    setDraft((p) => ({ ...p, [id]: { ...marksOf(id), [key]: safe } }));
  };

  const persist = (state: ScoreEntry["state"]) => {
    const updated: ScoreEntry[] = roster.map((s) => {
      const m = marksOf(s.id);
      const existing = scores.find((x) => x.studentId === s.id && x.subject === subject);
      return {
        id: existing?.id ?? `sc-${s.id}-${subject.replace(/\s/g, "")}`,
        studentId: s.id,
        className: klass,
        subject,
        ...m,
        state,
      };
    });
    onSaveScores(updated);
    onToast(state === "Draft" ? `Draft marks saved for ${subject} (${klass}).` : `${subject} continuous assessment submitted to the Head Teacher for approval.`);
  };

  const rating_of = (id: string) => {
    const mine = scores.filter((s) => s.studentId === id);
    return mine.length ? Math.round(mine.reduce((t, s) => t + subjectTotal(s), 0) / mine.length) : 0;
  };

  const pupil = roster.find((s) => s.id === pupilId) ?? roster[0];
  const cardRows = useMemo(() => {
    if (!pupil) return [];
    return subjects.map((sub) => {
      const rec = scores.find((s) => s.studentId === pupil.id && s.subject === sub);
      return {
        subject: sub,
        firstCA: rec?.firstCA ?? 0,
        secondCA: rec?.secondCA ?? 0,
        assignment: rec?.assignment ?? 0,
        project: rec?.project ?? 0,
        exam: rec?.exam ?? 0,
        total: rec ? subjectTotal(rec) : 0,
      };
    });
  }, [pupil, subjects, scores]);

  const obtained = cardRows.reduce((t, r) => t + r.total, 0);
  const obtainable = Math.max(cardRows.length * 100, 1);
  const cardAvg = Math.round((obtained / obtainable) * 100);
  const cardBand = gradeOf(cardAvg);
  const rank = pupil ? positionInClass(pupil.id, pupil.className, scores) : { position: 0, average: 0, of: 0 };
  const presentDays = pupil ? attendance.filter((a) => a.studentId === pupil.id && (a.status === "Present" || a.status === "Late")).length : 0;
  const totalDays = pupil ? attendance.filter((a) => a.studentId === pupil.id).length : 0;

  const statusFor = (id: string): AttendanceStatus => dayDraft[id] ?? attendance.find((a) => a.studentId === id && a.date === date)?.status ?? "Present";
  const saveAttendance = () => {
    const updated: AttendanceRecord[] = roster.map((s, i) => ({
      id: `att-${date}-${s.id}-${i}`,
      studentId: s.id,
      className: klass,
      date,
      status: statusFor(s.id),
    }));
    onSaveAttendance(updated);
    onToast(`Attendance register saved for ${klass} on ${date}.`);
  };
  const counts = STATUSES.map((st) => ({ st, n: roster.filter((s) => statusFor(s.id) === st).length }));

  const isNur = isNursery(klass);

  return (
    <div className="space-y-5">
      <motion.div {...anim} className="flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight">Academics, Assessment & Attendance</h1>
          <p className="text-[12.5px] text-muted-foreground">
            Continuous assessment, terminal report cards, class registers and 9-point grading for {SCHOOL.session}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={klass} disabled={locked} onChange={(e) => { setKlass(e.target.value); setSubject(subjectsFor(e.target.value)[0]); setDraft({}); }} className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-[12.5px] font-semibold outline-none">
            {(locked ? [klass] : available).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-[12px] font-semibold">
            <Printer size={15} /> Print
          </button>
        </div>
      </motion.div>

      <div className="flex gap-1.5 rounded-xl border border-border bg-card p-1.5 print:hidden">
        {([
          { k: "academics", label: "Score Entry & Cards", icon: ChalkboardTeacher },
          { k: "attendance", label: "Attendance Register", icon: CalendarCheck },
        ] as const).map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)} className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${tab === t.k ? "text-white" : "text-muted-foreground hover:bg-muted"}`}>
            {tab === t.k && <motion.span layoutId="ac-tab" className="absolute inset-0 rounded-lg bg-brand-navy dark:bg-brand-navy-light" />}
            <span className="relative z-10 flex items-center gap-1.5">
              <t.icon size={15} /> {t.label}
            </span>
          </button>
        ))}
      </div>

      {tab === "academics" ? (
        <div className="grid gap-4 xl:grid-cols-5">
          <motion.div {...anim} className={`${PANEL} p-4 xl:col-span-3 print:hidden`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-[13px] font-bold">
                <Notebook size={16} className="text-brand-emerald" /> Continuous Assessment Sheet
              </span>
              <select value={subject} onChange={(e) => { setSubject(e.target.value); setDraft({}); }} className="ml-auto rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-[12px] font-semibold outline-none">
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select value={term} onChange={(e) => setTerm(e.target.value)} className="rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-[12px] font-semibold outline-none">
                {TERMS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2">
              <MagnifyingGlass size={15} className="text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter pupils by name or admission number..." className="w-full bg-transparent text-[12px] outline-none placeholder:text-muted-foreground" />
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px] border-separate border-spacing-y-1.5">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    <th className="text-left font-semibold">Pupil</th>
                    {FIELDS.map((f) => (
                      <th key={f.key} className="font-semibold">
                        {f.label}
                      </th>
                    ))}
                    <th className="font-semibold">Total</th>
                    <th className="font-semibold">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((s) => {
                    const m = marksOf(s.id);
                    const total = m.firstCA + m.secondCA + m.assignment + m.project + m.exam;
                    const band = gradeOf(total);
                    return (
                      <tr key={s.id} className="bg-muted/30">
                        <td className="rounded-l-xl px-2 py-1.5">
                          <p className="text-[12px] font-semibold">
                            {s.firstName} {s.lastName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{s.admissionNo}</p>
                        </td>
                        {FIELDS.map((f) => (
                          <td key={f.key} className="px-1 py-1.5 text-center">
                            <input
                              type="number"
                              min={0}
                              max={f.max}
                              value={m[f.key]}
                              onChange={(e) => setMark(s.id, f.key, e.target.value, f.max)}
                              className="w-14 rounded-lg border border-border bg-card px-1.5 py-1 text-center text-[12px] outline-none focus:border-brand-emerald"
                            />
                          </td>
                        ))}
                        <td className="px-2 py-1.5 text-center text-[12.5px] font-bold">{total}</td>
                        <td className="rounded-r-xl px-2 py-1.5 text-center">
                          <span className={`rounded-md border px-2 py-0.5 text-[10.5px] font-bold ${gradeTone(band.letter)}`}>{band.letter}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <p className="mr-auto text-[11px] text-muted-foreground">
                CA 1 & 2 (10 each), Assignment (10), Project (10), Examination (60). Nine-point grading applies.
              </p>
              <button onClick={() => persist("Draft")} className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-[12px] font-semibold transition hover:bg-muted">
                <FloppyDisk size={15} /> Save draft
              </button>
              <button onClick={() => persist("Submitted")} className="flex items-center gap-1.5 rounded-xl bg-brand-emerald px-3.5 py-2 text-[12px] font-semibold text-white transition hover:opacity-90">
                <PaperPlaneTilt size={15} /> Submit for approval
              </button>
            </div>
          </motion.div>

          <motion.div {...anim} className={`${PANEL} p-4 xl:col-span-2`}>
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <span className="flex items-center gap-1.5 text-[13px] font-bold">
                <Certificate size={16} className="text-brand-gold" /> Terminal Report Card
              </span>
              <select value={pupil?.id ?? ""} onChange={(e) => setPupilId(e.target.value)} className="ml-auto rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-[12px] font-semibold outline-none">
                {roster.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>

            {!pupil ? (
              <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
                <WarningCircle size={26} className="mx-auto text-brand-gold" />
                <p className="mt-2 text-[12.5px] font-semibold">No pupil enrolled in {klass}</p>
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-border bg-white p-4 text-slate-900">
                <div className="school-crest rounded-xl px-3 py-3 text-center text-white">
                  <p className="text-[15px] font-extrabold tracking-tight">{SCHOOL.name}</p>
                  <p className="text-[10px] text-white/80">
                    {SCHOOL.address} / {SCHOOL.phone}
                  </p>
                  <p className="mt-0.5 text-[10.5px] font-semibold">
                    {term} Report Card - {SCHOOL.session}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <p>
                    <span className="font-semibold">Name:</span> {pupil.firstName} {pupil.lastName}
                  </p>
                  <p>
                    <span className="font-semibold">Admission:</span> {pupil.admissionNo}
                  </p>
                  <p>
                    <span className="font-semibold">Class:</span> {klass}
                  </p>
                  <p>
                    <span className="font-semibold">Gender:</span> {pupil.gender}
                  </p>
                  <p>
                    <span className="font-semibold">Times present:</span> {presentDays} of {totalDays || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Class position:</span> {rank.position} of {rank.of || "-"}
                  </p>
                </div>

                <table className="mt-3 w-full border-collapse text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600">
                      <th className="border border-slate-200 px-1.5 py-1 text-left">Subject</th>
                      <th className="border border-slate-200 px-1 py-1">1st</th>
                      <th className="border border-slate-200 px-1 py-1">2nd</th>
                      <th className="border border-slate-200 px-1 py-1">Assg</th>
                      <th className="border border-slate-200 px-1 py-1">Proj</th>
                      <th className="border border-slate-200 px-1 py-1">Exam</th>
                      <th className="border border-slate-200 px-1 py-1">Total</th>
                      <th className="border border-slate-200 px-1 py-1">Grade</th>
                      <th className="border border-slate-200 px-1 py-1">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cardRows.map((r) => {
                      const b = gradeOf(r.total);
                      return (
                        <tr key={r.subject}>
                          <td className="border border-slate-200 px-1.5 py-1 font-semibold">{r.subject}</td>
                          <td className="border border-slate-200 px-1 py-1 text-center">{r.firstCA}</td>
                          <td className="border border-slate-200 px-1 py-1 text-center">{r.secondCA}</td>
                          <td className="border border-slate-200 px-1 py-1 text-center">{r.assignment}</td>
                          <td className="border border-slate-200 px-1 py-1 text-center">{r.project}</td>
                          <td className="border border-slate-200 px-1 py-1 text-center">{r.exam}</td>
                          <td className="border border-slate-200 px-1 py-1 text-center font-bold">{r.total}</td>
                          <td className="border border-slate-200 px-1 py-1 text-center font-bold">{b.letter}</td>
                          <td className="border border-slate-200 px-1 py-1">{b.remark}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10.5px]">
                  <div className="rounded-lg bg-slate-100 p-2">
                    <p className="text-slate-500">Marks obtained</p>
                    <p className="text-[13px] font-extrabold">
                      {obtained}/{obtainable}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-100 p-2">
                    <p className="text-slate-500">Average</p>
                    <p className="text-[13px] font-extrabold">{cardAvg}%</p>
                  </div>
                  <div className="rounded-lg bg-slate-100 p-2">
                    <p className="text-slate-500">Overall grade</p>
                    <p className="text-[13px] font-extrabold">{cardBand.letter}</p>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Affective domain</p>
                    {AFFECTIVE_DOMAINS.map((d, i) => (
                      <p key={d} className="flex justify-between text-[10.5px]">
                        <span>{d}</span>
                        <span className="font-semibold">{rating(pupil.id.length * 7 + i * 3 + d.length)}</span>
                      </p>
                    ))}
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Psychomotor {isNur ? "& readiness" : "skills"}
                    </p>
                    {PSYCHOMOTOR_DOMAINS.map((d, i) => (
                      <p key={d} className="flex justify-between text-[10.5px]">
                        <span>{d}</span>
                        <span className="font-semibold">{rating(pupil.id.length * 5 + i * 4 + d.length)}</span>
                      </p>
                    ))}
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-[10.5px]">
                  <p className="rounded-lg bg-slate-100 p-2">
                    <span className="font-bold">Class teacher remark: </span>
                    {remarkFor(cardAvg)}
                  </p>
                  <p className="rounded-lg bg-slate-100 p-2">
                    <span className="font-bold">Head teacher remark: </span>
                    {cardAvg >= 70 ? "Promoted. A commendable result - keep it up." : "Promoted. Needs closer home support next term."}
                  </p>
                </div>

                <div className="mt-4 flex items-end justify-between text-[10px] text-slate-500">
                  <span>_____________ Class Teacher</span>
                  <span className="rounded-full border border-slate-300 px-2 py-0.5 text-[9px] font-bold uppercase">Next term resumes 12 May</span>
                  <span>_____________ Head Teacher</span>
                </div>
              </div>
            )}
            <button onClick={() => window.print()} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-navy py-2 text-[12px] font-semibold text-white dark:bg-brand-navy-light print:hidden">
              <Printer size={15} /> Print / export report card
            </button>
          </motion.div>
        </div>
      ) : (
        <>
          <div className={`${PANEL} flex flex-wrap items-center gap-2 p-3`}>
            <span className="flex items-center gap-1.5 text-[13px] font-bold">
              <CalendarCheck size={16} className="text-brand-emerald" /> Daily Register
            </span>
            <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setDayDraft({}); }} className="ml-auto rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-[12px] font-semibold outline-none" />
            <button onClick={() => setDayDraft(Object.fromEntries(roster.map((s) => [s.id, "Present" as AttendanceStatus])))} className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-semibold transition hover:bg-muted">
              Mark all present
            </button>
            <button onClick={saveAttendance} className="rounded-lg bg-brand-emerald px-3.5 py-1.5 text-[12px] font-semibold text-white">
              Save register
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {counts.map((c) => (
              <motion.div key={c.st} {...anim} className={`${PANEL} p-4`}>
                <p className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">{c.st}</p>
                <p className="mt-2 text-[24px] font-extrabold leading-none">{c.n}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{roster.length ? Math.round((c.n / roster.length) * 100) : 0}% of the class</p>
              </motion.div>
            ))}
          </div>

          {roster.length === 0 ? (
            <div className={`${PANEL} p-10 text-center`}>
              <WarningCircle size={28} className="mx-auto text-brand-gold" />
              <p className="mt-2 text-[13.5px] font-bold">No pupils enrolled in {klass}</p>
            </div>
          ) : (
            <motion.div {...anim} className={`${PANEL} divide-y divide-border`}>
              {roster.map((s) => {
                const st = statusFor(s.id);
                return (
                  <div key={s.id} className="flex flex-wrap items-center gap-3 p-3">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${s.tone} text-[11.5px] font-bold text-white`}>
                      {s.firstName[0]}
                      {s.lastName[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-semibold">
                        {s.firstName} {s.lastName}
                      </p>
                      <p className="truncate text-[10.5px] text-muted-foreground">
                        {s.admissionNo} / guardian {s.guardianName}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      {STATUSES.map((x) => (
                        <button
                          key={x}
                          onClick={() => setDayDraft((p) => ({ ...p, [s.id]: x }))}
                          className={`rounded-lg px-2.5 py-1.5 text-[10.5px] font-bold transition ${st === x ? STATUS_TONE[x] : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
                        >
                          {x}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Pupils on register", value: String(roster.length) },
              { label: "Attendance rate", value: `${presentDays + roster.filter((s) => statusFor(s.id) === "Late").length > 0 && roster.length ? Math.round((counts[0].n + counts[1].n) / roster.length * 100) : 0}%` },
              { label: "Absent today", value: String(counts[3].n) },
            ].map((x) => (
              <div key={x.label} className={`${PANEL} p-4`}>
                <p className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">{x.label}</p>
                <p className="mt-2 text-[20px] font-extrabold">{x.value}</p>
              </div>
            ))}
          </div>

          <div className={`${PANEL} p-5`}>
            <h2 className="flex items-center gap-2 text-[14px] font-bold">
              <Trophy size={17} className="text-brand-gold" /> Pupil standing in {klass}
            </h2>
            <div className="mt-3 space-y-2">
              {[...roster]
                .sort((a, b) => rating_of(b.id) - rating_of(a.id))
                .slice(0, 5)
                .map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">
                      {s.firstName} {s.lastName}
                    </span>
                    <span className="text-[11.5px] text-muted-foreground">avg {rating_of(s.id)}%</span>
                    <span className={`rounded-md border px-2 py-0.5 text-[10.5px] font-bold ${gradeTone(gradeOf(rating_of(s.id)).letter)}`}>{gradeOf(rating_of(s.id)).letter}</span>
                  </div>
                ))}
            </div>
            <button onClick={() => setTab("academics")} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-[12px] font-semibold">
              Open score entry <CaretRight size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
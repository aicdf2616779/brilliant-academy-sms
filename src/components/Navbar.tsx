import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Buildings,
  CalendarCheck,
  CaretDown,
  ChalkboardTeacher,
  ChartPieSlice,
  Check,
  ClipboardText,
  GraduationCap,
  MagnifyingGlass,
  Megaphone,
  Moon,
  Receipt,
  Student,
  Sun,
  Wallet,
  X,
} from "@phosphor-icons/react";
import type { DemoUser, Payment, Role, Staff, Student as Pupil, View } from "@/types";
import { DEMO_USERS, SCHOOL, TERMS, money } from "@/data/mockData";

interface NavItem {
  key: View;
  label: string;
  icon: typeof ChartPieSlice;
  roles: Role[];
}

const ALL: Role[] = ["Super Admin", "Head Teacher", "Teacher", "Bursar", "Parent", "Student"];

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: ChartPieSlice, roles: ALL },
  { key: "students", label: "Students & Parents", icon: Student, roles: ALL },
  { key: "admissions", label: "Admissions", icon: Buildings, roles: ["Super Admin", "Head Teacher"] },
  { key: "attendance", label: "Attendance Register", icon: CalendarCheck, roles: ["Super Admin", "Head Teacher", "Teacher"] },
  { key: "academics", label: "Academics & Report Cards", icon: ChalkboardTeacher, roles: ALL },
  { key: "finance", label: "Bursary & Fees", icon: Wallet, roles: ["Super Admin", "Head Teacher", "Bursar", "Parent"] },
  { key: "timetable", label: "Timetable & Homework", icon: ClipboardText, roles: ALL },
  { key: "communication", label: "Communication & Calendar", icon: Megaphone, roles: ALL },
];

interface NavbarProps {
  user: DemoUser;
  onUserChange: (u: DemoUser) => void;
  view: View;
  onView: (v: View) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  students: Pupil[];
  staff: Staff[];
  payments: Payment[];
  announcements: { id: string; title: string; body: string; date: string; audience: string }[];
}

export default function Navbar({
  user,
  onUserChange,
  view,
  onView,
  theme,
  onToggleTheme,
  students,
  staff,
  payments,
  announcements,
}: NavbarProps) {
  const [switcher, setSwitcher] = useState(false);
  const [notes, setNotes] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setSwitcher(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((s) => !s);
      }
      if (e.key === "Escape") {
        setSearch(false);
        setSwitcher(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const items = useMemo(() => NAV_ITEMS.filter((i) => i.roles.includes(user.role)), [user.role]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const found: { id: string; label: string; sub: string; kind: string; view: View }[] = [];
    students
      .filter((s) => `${s.firstName} ${s.lastName} ${s.admissionNo} ${s.className}`.toLowerCase().includes(q))
      .slice(0, 5)
      .forEach((s) => found.push({ id: s.id, label: `${s.firstName} ${s.lastName}`, sub: `${s.className} - ${s.admissionNo}`, kind: "Student", view: "students" }));
    staff
      .filter((s) => `${s.name} ${s.role} ${s.className}`.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((s) => found.push({ id: s.id, label: s.name, sub: `${s.role} - ${s.className}`, kind: "Staff", view: "students" }));
    payments
      .filter((p) => `${p.receiptNo} ${p.reference} ${p.bank}`.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((p) => found.push({ id: p.id, label: p.receiptNo, sub: `${money(p.amount)} - ${p.method}`, kind: "Payment", view: "finance" }));
    return found;
  }, [query, students, staff, payments]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-3 sm:px-5">
        <button onClick={() => onView("dashboard")} className="flex shrink-0 items-center gap-2.5">
          <span className="school-crest grid h-10 w-10 place-items-center rounded-xl text-white shadow-md">
            <GraduationCap size={22} weight="fill" />
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[15px] font-bold tracking-tight">{SCHOOL.name}</span>
            <span className="block text-[11px] font-medium text-muted-foreground">{SCHOOL.tagline}</span>
          </span>
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden items-center gap-1.5 rounded-xl border border-border bg-muted/50 px-2.5 py-1.5 text-[12px] font-medium lg:flex">
            <span className="text-brand-emerald">{SCHOOL.session}</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold">{SCHOOL.term}</span>
            <span className="ml-1 hidden text-muted-foreground xl:inline">of {TERMS.length} terms</span>
          </div>

          <button
            onClick={() => setSearch(true)}
            className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 text-[13px] text-muted-foreground transition hover:border-brand-emerald/40 hover:text-foreground"
          >
            <MagnifyingGlass size={16} />
            <span className="hidden xl:inline">Search registry</span>
          </button>

          <button
            onClick={() => setNotes(true)}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-muted/50 transition hover:text-brand-emerald"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-gold ring-2 ring-card" />
          </button>

          <button
            onClick={onToggleTheme}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-muted/50 transition hover:text-brand-gold"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative" ref={rootRef}>
            <button
              onClick={() => setSwitcher((s) => !s)}
              className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 py-1.5 pl-1.5 pr-2.5 transition hover:border-brand-emerald/50"
            >
              <span className={`grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br ${user.accent} text-[11px] font-bold text-white`}>
                {user.initials}
              </span>
              <span className="hidden text-left leading-tight md:block">
                <span className="block max-w-[130px] truncate text-[12px] font-semibold">{user.name}</span>
                <span className="block text-[10px] font-medium text-muted-foreground">{user.role}</span>
              </span>
              <CaretDown size={14} className={`transition ${switcher ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {switcher && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 mt-2 w-[21rem] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                >
                  <div className="border-b border-border bg-muted/40 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Switch working role</p>
                  </div>
                  <div className="max-h-[22rem] overflow-y-auto p-1.5">
                    {DEMO_USERS.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onUserChange(u);
                          setSwitcher(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-muted"
                      >
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${u.accent} text-[11px] font-bold text-white`}>
                          {u.initials}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold">{u.name}</span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {u.role} / {u.scope}
                          </span>
                          <span className="block truncate text-[10.5px] text-muted-foreground/80">
                            {u.email} / {u.phone}
                          </span>
                        </span>
                        {u.id === user.id && <Check size={16} className="shrink-0 text-brand-emerald" weight="bold" />}
                      </button>
                    ))}
                  </div>
                  <p className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
                    Every demo role shares the password{" "}
                    <span className="font-semibold text-brand-emerald">Brilliant@2025</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <nav className="mx-auto flex max-w-[1500px] gap-1 overflow-x-auto px-3 pb-2 sm:px-5">
        {items.map(({ key, label, icon: Icon }) => {
          const active = view === key;
          return (
            <button
              key={key}
              onClick={() => onView(key)}
              className={`relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition ${
                active ? "text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-lg bg-brand-navy dark:bg-brand-navy-light"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon size={15} className="relative z-10" weight={active ? "fill" : "regular"} />
              <span className="relative z-10 whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </nav>

      <AnimatePresence>
        {search && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setSearch(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16 }}
              onClick={(e) => e.stopPropagation()}
              className="mt-[12vh] w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <MagnifyingGlass size={18} className="text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a pupil, staff member, class or receipt..."
                  className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
                />
                <button onClick={() => setSearch(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {query.trim() === "" && (
                  <p className="px-3 py-6 text-center text-[12px] text-muted-foreground">
                    Type a name, admission number, class or receipt number to search the school registry.
                  </p>
                )}
                {query.trim() !== "" && results.length === 0 && (
                  <p className="px-3 py-6 text-center text-[12px] text-muted-foreground">No matching record found.</p>
                )}
                {results.map((r) => (
                  <button
                    key={`${r.kind}-${r.id}`}
                    onClick={() => {
                      onView(r.view);
                      setSearch(false);
                      setQuery("");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-muted"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-emerald/10 text-brand-emerald">
                      {r.kind === "Student" ? <Student size={16} /> : r.kind === "Staff" ? <ChalkboardTeacher size={16} /> : <Receipt size={16} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">{r.label}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{r.sub}</span>
                    </span>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{r.kind}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notes && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <div>
                <p className="text-[13px] font-bold">Notification Centre</p>
                <p className="text-[11px] text-muted-foreground">{announcements.length} school broadcasts</p>
              </div>
              <button onClick={() => setNotes(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {announcements.map((n) => (
                <div key={n.id} className="rounded-xl border border-border bg-muted/40 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12.5px] font-semibold">{n.title}</p>
                    <span className="shrink-0 rounded-md bg-brand-gold/15 px-1.5 py-0.5 text-[9.5px] font-bold text-brand-gold">{n.audience}</span>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{n.body}</p>
                  <p className="mt-1.5 text-[10.5px] text-muted-foreground">{n.date}</p>
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </header>
  );
}
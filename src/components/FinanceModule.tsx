import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bank,
  CheckCircle,
  CurrencyNgn,
  MagnifyingGlass,
  Printer,
  Receipt,
  TrendUp,
  Wallet,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import type { DemoUser, Invoice, Payment, Student } from "@/types";
import { FEE_STRUCTURE, PAYMENTS, SCHOOL, money } from "@/data/mockData";

const PANEL = "rounded-2xl border border-border bg-card shadow-sm";
const anim = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const TODAY = new Date().toISOString().slice(0, 10);
const STATUS_TONE: Record<Invoice["status"], string> = {
  Paid: "bg-emerald-600/15 text-emerald-700",
  "Part Paid": "bg-amber-500/15 text-amber-700",
  Outstanding: "bg-rose-600/15 text-rose-700",
};
const BAR: Record<Invoice["status"], string> = { Paid: "bg-emerald-500", "Part Paid": "bg-amber-500", Outstanding: "bg-rose-500" };

interface Props {
  user: DemoUser;
  students: Student[];
  invoices: Invoice[];
  payments: Payment[];
  onRecordPayment: (p: Payment) => void;
  onToast: (m: string) => void;
}

export default function FinanceModule({ user, students, invoices, payments, onRecordPayment, onToast }: Props) {
  const canPost = user.role === "Super Admin" || user.role === "Head Teacher" || user.role === "Bursar";
  const [klass, setKlass] = useState("All classes");
  const [status, setStatus] = useState("All");
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<Invoice | null>(null);
  const [receipt, setReceipt] = useState<Payment | null>(null);

  const rows = useMemo(
    () =>
      invoices.map((inv) => ({
        inv,
        pupil: students.find((s) => s.id === inv.studentId),
      })),
    [invoices, students],
  );

  const classOptions = useMemo(() => ["All classes", ...Array.from(new Set(rows.map((r) => r.pupil?.className).filter((c): c is string => Boolean(c))))], [rows]);
  const statusOptions = useMemo(() => ["All", ...Array.from(new Set(invoices.map((i) => i.status)))], [invoices]);
  const methodOptions = useMemo(() => Array.from(new Set(payments.map((p) => p.method))), [payments]);
  const bankOptions = useMemo(() => Array.from(new Set(payments.map((p) => p.bank))), [payments]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (klass !== "All classes" && r.pupil?.className !== klass) return false;
      if (status !== "All" && r.inv.status !== status) return false;
      if (!needle) return true;
      return `${r.pupil?.firstName ?? ""} ${r.pupil?.lastName ?? ""} ${r.pupil?.admissionNo ?? ""}`.toLowerCase().includes(needle);
    });
  }, [rows, klass, status, q]);

  const billed = invoices.reduce((t, i) => t + i.amountDue, 0);
  const collected = invoices.reduce((t, i) => t + i.amountPaid, 0);
  const outstanding = billed - collected;
  const rate = billed ? Math.round((collected / billed) * 100) : 0;
  const termVote = FEE_STRUCTURE.reduce((t, f) => t + f.amount, 0);

  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState(() => methodOptions[0]);
  const [bank, setBank] = useState(() => bankOptions[0]);
  const [reference, setReference] = useState("");

  const openPayment = (inv: Invoice) => {
    setTarget(inv);
    setAmount(Math.max(inv.amountDue - inv.amountPaid, 0));
    setReference(`TRF/${inv.studentId.toUpperCase()}/${Math.floor(Math.random() * 9000 + 1000)}`);
  };

  const submit = () => {
    if (!target) return;
    const amt = Math.max(0, Math.min(amount, target.amountDue - target.amountPaid));
    if (amt <= 0) {
      onToast("Enter an amount greater than zero to post this receipt.");
      return;
    }
    const p: Payment = {
      ...PAYMENTS[0],
      id: `pay-${Date.now()}`,
      studentId: target.studentId,
      amount: amt,
      method,
      bank,
      reference,
      receiptNo: `BA/${String(payments.length + 1).padStart(4, "0")}`,
      date: TODAY,
    };
    onRecordPayment(p);
    setReceipt(p);
    setTarget(null);
    onToast(`${money(amt)} receipted for ${students.find((s) => s.id === target.studentId)?.firstName ?? "the pupil"}.`);
  };

  return (
    <div className="space-y-5">
      <motion.div {...anim}>
        <h1 className="text-[22px] font-extrabold tracking-tight">Bursary & Fee Management</h1>
        <p className="text-[12.5px] text-muted-foreground">
          Bills, receipts, outstanding balances and the {SCHOOL.term} collection report for {SCHOOL.session}.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total billed", value: money(billed), sub: `${invoices.length} invoices`, icon: Wallet, tone: "bg-brand-navy" },
          { label: "Fees collected", value: money(collected), sub: `${payments.length} receipts posted`, icon: CurrencyNgn, tone: "bg-brand-emerald" },
          { label: "Outstanding", value: money(outstanding), sub: `${invoices.filter((i) => i.status !== "Paid").length} debtors`, icon: WarningCircle, tone: "bg-rose-600" },
          { label: "Collection rate", value: `${rate}%`, sub: "Against term billing", icon: TrendUp, tone: "bg-brand-gold" },
        ].map((s) => (
          <motion.div key={s.label} {...anim} className={`${PANEL} p-4`}>
            <div className="flex items-center gap-2.5">
              <span className={`grid h-9 w-9 place-items-center rounded-xl text-white ${s.tone}`}>
                <s.icon size={17} weight="fill" />
              </span>
              <p className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
            </div>
            <p className="mt-3 text-[22px] font-extrabold leading-none">{s.value}</p>
            <p className="mt-1.5 text-[11.5px] text-muted-foreground">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <motion.div {...anim} className={`${PANEL} p-4`}>
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[13px] font-bold">
            <TrendUp size={16} className="text-brand-emerald" /> Collection progress
          </p>
          <span className="text-[11.5px] font-semibold text-muted-foreground">
            {money(collected)} of {money(billed)}
          </span>
        </div>
        <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.span initial={{ width: 0 }} animate={{ width: `${rate}%` }} transition={{ duration: 0.7 }} className="block h-full rounded-full bg-brand-emerald" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["Paid", "Part Paid", "Outstanding"] as const).map((st) => (
            <span key={st} className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1 text-[11px] font-semibold">
              <span className={`h-2 w-2 rounded-full ${BAR[st]}`} /> {st}: {invoices.filter((i) => i.status === st).length}
            </span>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-4 xl:grid-cols-3">
        <motion.div {...anim} className={`${PANEL} p-4 xl:col-span-1`}>
          <p className="text-[13px] font-bold">Approved fee structure</p>
          <p className="text-[11px] text-muted-foreground">Per pupil, {SCHOOL.term} {SCHOOL.session}</p>
          <div className="mt-3 space-y-1.5">
            {FEE_STRUCTURE.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2">
                <span className="text-[12px] font-medium">{f.label}</span>
                <span className="text-[12px] font-bold">{money(f.amount)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-navy px-3 py-2.5 text-white dark:bg-brand-navy-light">
            <span className="text-[12px] font-semibold">Total per pupil</span>
            <span className="text-[14px] font-extrabold">{money(termVote)}</span>
          </div>
        </motion.div>

        <div className="space-y-4 xl:col-span-2">
          <div className={`${PANEL} flex flex-wrap items-center gap-2 p-3`}>
            <div className="flex min-w-[180px] flex-1 items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2">
              <MagnifyingGlass size={15} className="text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pupil or admission number..." className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-muted-foreground" />
            </div>
            <select value={klass} onChange={(e) => setKlass(e.target.value)} className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-[12.5px] font-medium outline-none">
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-[12.5px] font-medium outline-none">
              {statusOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {shown.length === 0 ? (
            <div className={`${PANEL} p-10 text-center`}>
              <WarningCircle size={28} className="mx-auto text-brand-gold" />
              <p className="mt-2 text-[13.5px] font-bold">No invoice matches this filter</p>
              <p className="mt-1 text-[12px] text-muted-foreground">Try another class, status or search term.</p>
            </div>
          ) : (
            <motion.div {...anim} className={`${PANEL} overflow-hidden`}>
              <div className="divide-y divide-border">
                {shown.map(({ inv, pupil }) => {
                  const balance = inv.amountDue - inv.amountPaid;
                  const progress = inv.amountDue ? Math.round((inv.amountPaid / inv.amountDue) * 100) : 0;
                  return (
                    <div key={inv.id} className="flex flex-wrap items-center gap-3 p-3.5">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${pupil?.tone ?? "from-slate-500 to-slate-700"} text-[12px] font-bold text-white`}>
                        {(pupil?.firstName[0] ?? "?") + (pupil?.lastName[0] ?? "")}
                      </span>
                      <div className="min-w-[150px] flex-1">
                        <p className="truncate text-[13px] font-bold">
                          {pupil ? `${pupil.firstName} ${pupil.lastName}` : "Unlinked pupil"}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {pupil?.className} / {pupil?.admissionNo} / {inv.term}
                        </p>
                      </div>
                      <div className="min-w-[120px]">
                        <p className="text-[11px] text-muted-foreground">Billed {money(inv.amountDue)}</p>
                        <p className="text-[12px] font-semibold">Paid {money(inv.amountPaid)}</p>
                        <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                          <span className={`block h-full rounded-full ${BAR[inv.status]}`} style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <div className="min-w-[100px] text-right">
                        <span className={`rounded-md px-2 py-0.5 text-[10.5px] font-bold ${STATUS_TONE[inv.status]}`}>{inv.status}</span>
                        <p className="mt-1 text-[12px] font-bold text-rose-600 dark:text-rose-400">{balance > 0 ? money(balance) : "Settled"}</p>
                      </div>
                      <button
                        onClick={() => (canPost ? openPayment(inv) : onToast("Only the Bursar, Head Teacher or Super Admin can post a receipt. Contact the bursary for payment."))}
                        className={`rounded-xl px-3 py-2 text-[11.5px] font-semibold ${canPost ? "bg-brand-emerald text-white transition hover:opacity-90" : "border border-border text-muted-foreground"}`}
                      >
                        {canPost ? "Record payment" : "Enquire"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div {...anim} className={`${PANEL} p-4`}>
        <p className="flex items-center gap-1.5 text-[13px] font-bold">
          <Receipt size={16} className="text-brand-navy dark:text-brand-navy-light" /> Recent receipts
        </p>
        {payments.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-8 text-center text-[12px] text-muted-foreground">No payment has been recorded this term yet.</p>
        ) : (
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {payments.slice(0, 9).map((p) => {
              const pupil = students.find((s) => s.id === p.studentId);
              return (
                <button key={p.id} onClick={() => setReceipt(p)} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 text-left transition hover:border-brand-emerald/50">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-emerald/10 text-brand-emerald">
                    <Bank size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-semibold">
                      {pupil ? `${pupil.firstName} ${pupil.lastName}` : "School account"}
                    </span>
                    <span className="block truncate text-[10.5px] text-muted-foreground">
                      {p.receiptNo} / {p.method} / {p.date}
                    </span>
                  </span>
                  <span className="shrink-0 text-[12.5px] font-bold">{money(p.amount)}</span>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {target && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setTarget(null)} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[15px] font-bold">Post a fee receipt</p>
                  <p className="text-[11.5px] text-muted-foreground">
                    {students.find((s) => s.id === target.studentId)?.firstName ?? "Pupil"} / balance {money(target.amountDue - target.amountPaid)}
                  </p>
                </div>
                <button onClick={() => setTarget(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Amount received (₦)</span>
                  <input type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-[13px] font-semibold outline-none focus:border-brand-emerald" />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Payment method</span>
                    <select value={method} onChange={(e) => setMethod(e.target.value as Payment["method"])} className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-[12.5px] font-medium outline-none">
                      {methodOptions.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Bank / channel</span>
                    <select value={bank} onChange={(e) => setBank(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-[12.5px] font-medium outline-none">
                      {bankOptions.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Teller / transfer reference</span>
                  <input value={reference} onChange={(e) => setReference(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-[12.5px] outline-none focus:border-brand-emerald" />
                </label>
                <p className="rounded-xl bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
                  Posted by {user.name} ({user.role}) on {TODAY}. The balance updates immediately and the receipt is issued to the guardian.
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => setTarget(null)} className="flex-1 rounded-xl border border-border py-2.5 text-[12.5px] font-semibold">
                  Cancel
                </button>
                <button onClick={submit} className="flex-1 rounded-xl bg-brand-emerald py-2.5 text-[12.5px] font-semibold text-white">
                  Post receipt
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {receipt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReceipt(null)} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-border bg-white p-5 text-slate-900 shadow-2xl"
            >
              <div className="school-crest rounded-xl px-3 py-3 text-center text-white">
                <p className="text-[14px] font-extrabold">{SCHOOL.name}</p>
                <p className="text-[10px] text-white/80">
                  {SCHOOL.address} / {SCHOOL.phone}
                </p>
              </div>
              <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">Official fee receipt</p>
              <div className="mt-3 space-y-1.5 text-[12px]">
                {[
                  ["Receipt number", receipt.receiptNo],
                  ["Pupil", (() => { const s = students.find((x) => x.id === receipt.studentId); return s ? `${s.firstName} ${s.lastName} (${s.className})` : "School account"; })()],
                  ["Amount", money(receipt.amount)],
                  ["Method", receipt.method],
                  ["Bank / channel", receipt.bank],
                  ["Reference", receipt.reference],
                  ["Date", receipt.date],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-3 border-b border-dashed border-slate-200 pb-1.5">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-right font-semibold">{v}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle size={14} weight="fill" /> Receipt posted and credited to the pupil account
              </p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => window.print()} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 py-2.5 text-[12.5px] font-semibold text-slate-700">
                  <Printer size={15} /> Print
                </button>
                <button onClick={() => setReceipt(null)} className="flex-1 rounded-xl bg-brand-navy py-2.5 text-[12.5px] font-semibold text-white">
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import { Fee, CancelledFee } from "./store";

const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

type HasAmount = { amountRaw: number; cycle: "Monthly" | "Yearly" };

export function monthlyEquivalent(fee: HasAmount): number {
  return fee.cycle === "Monthly" ? fee.amountRaw : fee.amountRaw / 12;
}

export function annualEquivalent(fee: HasAmount): number {
  return fee.cycle === "Monthly" ? fee.amountRaw * 12 : fee.amountRaw;
}

export interface MonthPoint   { month: string; value: number }
export interface CategoryPoint { category: string; monthly: number }
export interface BigFeePoint  { fee: Fee; annual: number; monthly: number }

export interface Insights {
  monthlyTotal: number;
  savedThisYear: number;
  cancelledThisYearCount: number;
  savingsByMonth: MonthPoint[];
  spendByMonth: MonthPoint[];
  spendByCategory: CategoryPoint[];
  biggestFees: BigFeePoint[];
}

export function computeInsights(fees: Fee[], cancelledFees: CancelledFee[], now: Date): Insights {
  const currentYear     = now.getFullYear();
  const currentMonthIdx = now.getMonth(); // 0-indexed

  // ── shared monthly total (same number everywhere it appears) ──────────────
  const monthlyTotal = Math.round(fees.reduce((sum, f) => sum + monthlyEquivalent(f), 0));

  // ── cancelled this calendar year ─────────────────────────────────────────
  const cancelledThisYear = cancelledFees.filter(
    (f) => new Date(f.cancelledWhenISO).getFullYear() === currentYear,
  );

  // ── Section 1: savedThisYear (full-year projection) ───────────────────────
  // monthsAvoided = 12 − (1-based month of cancellation)
  const savedThisYear = cancelledThisYear.reduce((sum, f) => {
    const cancelMonth1 = new Date(f.cancelledWhenISO).getMonth() + 1;
    return sum + monthlyEquivalent(f) * (12 - cancelMonth1);
  }, 0);

  // ── Section 2: savingsByMonth (cumulative, Jan → current month) ───────────
  // value[m] = Σ monthlyEquiv(f) × (m − cancelMonthIdx) for cancelled fees where cancelMonthIdx ≤ m
  const savingsByMonth: MonthPoint[] = [];
  for (let m = 0; m <= currentMonthIdx; m++) {
    let value = 0;
    for (const f of cancelledThisYear) {
      const cm = new Date(f.cancelledWhenISO).getMonth();
      if (cm <= m) value += monthlyEquivalent(f) * (m - cm);
    }
    savingsByMonth.push({ month: MONTH_ABBR[m], value: Math.round(value) });
  }

  // ── Section 3: spendByMonth (last 6 months, fees amortized monthly) ───────
  const spendByMonth: MonthPoint[] = [];
  for (let offset = 5; offset >= 0; offset--) {
    let mIdx  = currentMonthIdx - offset;
    let mYear = currentYear;
    if (mIdx < 0) { mIdx += 12; mYear -= 1; }

    let value = 0;

    // Active fees added before or during this month
    for (const f of fees) {
      const d = new Date(f.dateAddedISO);
      if (d.getFullYear() < mYear || (d.getFullYear() === mYear && d.getMonth() <= mIdx)) {
        value += monthlyEquivalent(f);
      }
    }

    // Cancelled fees: active during this month if cancelled AFTER it
    for (const f of cancelledFees) {
      const d = new Date(f.cancelledWhenISO);
      const cancelledAfter =
        d.getFullYear() > mYear || (d.getFullYear() === mYear && d.getMonth() > mIdx);
      if (cancelledAfter) value += monthlyEquivalent(f);
    }

    spendByMonth.push({ month: MONTH_ABBR[mIdx], value: Math.round(value) });
  }

  // ── Section 4: spendByCategory ────────────────────────────────────────────
  const catMap = new Map<string, number>();
  for (const f of fees) {
    catMap.set(f.category, (catMap.get(f.category) ?? 0) + monthlyEquivalent(f));
  }
  const spendByCategory: CategoryPoint[] = Array.from(catMap.entries())
    .map(([category, monthly]) => ({ category, monthly }))
    .sort((a, b) => b.monthly - a.monthly);

  // ── Section 5: biggestFees ────────────────────────────────────────────────
  const biggestFees: BigFeePoint[] = fees
    .map((f) => ({ fee: f, annual: annualEquivalent(f), monthly: monthlyEquivalent(f) }))
    .sort((a, b) => b.annual - a.annual);

  return {
    monthlyTotal,
    savedThisYear,
    cancelledThisYearCount: cancelledThisYear.length,
    savingsByMonth,
    spendByMonth,
    spendByCategory,
    biggestFees,
  };
}

import { useSyncExternalStore } from "react";

export type Cycle = "Monthly" | "Yearly";

export interface Fee {
  id: string;
  name: string;
  domain?: string;
  amountDisplay: string;
  amountRaw: number;
  currency: string;        // native billing currency, never overwritten
  cycle: Cycle;
  nextRenewal: string;
  nextRenewalISO: string;
  daysUntil: number;
  category: string;
  dateAdded: string;
  dateAddedISO: string;
}

export interface CancelledFee {
  id: string;
  name: string;
  domain?: string;
  wasDisplay: string;
  amountRaw: number;
  currency: string;
  cycle: Cycle;
  cancelledWhen: string;
  cancelledWhenISO: string;
}

// ── Pro gating ────────────────────────────────────────────────────────────────
export const FREE_FEE_LIMIT     = 5;
export const FREE_AI_SCAN_LIMIT = 3;

// ── Profile ───────────────────────────────────────────────────────────────────
export interface Profile {
  name: string;
  email: string;
  avatarUri?: string;
}

// ── Settings ──────────────────────────────────────────────────────────────────
export interface Settings {
  reminderEnabled: boolean;
  reminderTiming: number;   // days before renewal: 1 | 3 | 7 | 14 | custom
  renewalDayAlert: boolean;
  displayCurrency: string;  // ISO 4217 display/reporting currency
}

// ── Currency metadata ─────────────────────────────────────────────────────────
export const CURRENCIES: { code: string; symbol: string; label: string }[] = [
  { code: "EUR", symbol: "€",  label: "Euro" },
  { code: "USD", symbol: "$",  label: "US Dollar" },
  { code: "GBP", symbol: "£",  label: "British Pound" },
  { code: "SEK", symbol: "kr", label: "Swedish Krona" },
  { code: "NOK", symbol: "kr", label: "Norwegian Krone" },
  { code: "DKK", symbol: "kr", label: "Danish Krone" },
  { code: "CHF", symbol: "Fr", label: "Swiss Franc" },
  { code: "JPY", symbol: "¥",  label: "Japanese Yen" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
];

export function currencyMeta(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

// FX SEAM: returns amount unchanged until real ECB-based rates are wired.
// isApprox=true signals the ≈ prefix in display.
// TODO: replace with daily-cached ECB rate fetch.
export function toDisplayCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
): { value: number; isApprox: boolean } {
  if (fromCurrency === toCurrency) return { value: amount, isApprox: false };
  return { value: amount, isApprox: true };
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const INITIAL_ACTIVE: Fee[] = [];

const INITIAL_CANCELLED: CancelledFee[] = [];

// ── Mutable state ─────────────────────────────────────────────────────────────

let activeFees: Fee[]             = [...INITIAL_ACTIVE];
let cancelledFees: CancelledFee[] = [...INITIAL_CANCELLED];

let _profile: Profile = { name: "Matti Virtanen", email: "matti@example.com" };

let _settings: Settings = {
  reminderEnabled: true,
  reminderTiming: 14,
  renewalDayAlert: false,
  displayCurrency: "EUR",
};

let _isPro = false;

const listeners = new Set<() => void>();

function notify() { listeners.forEach((fn) => fn()); }

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

// ── Fees ──────────────────────────────────────────────────────────────────────

export function useFees(): Fee[] {
  return useSyncExternalStore(subscribe, () => activeFees);
}

export function useCancelledFees(): CancelledFee[] {
  return useSyncExternalStore(subscribe, () => cancelledFees);
}

export function getFeeById(id: string): Fee | undefined {
  return activeFees.find((f) => f.id === id);
}

export function getCancelledFeeById(id: string): CancelledFee | undefined {
  return cancelledFees.find((f) => f.id === id);
}

export function savedSinceCancel(fee: CancelledFee): number {
  const cancelled = new Date(fee.cancelledWhenISO);
  const now = new Date();
  const days = Math.floor((now.getTime() - cancelled.getTime()) / (1000 * 60 * 60 * 24));
  const cycleDays = fee.cycle === "Monthly" ? 30 : 365;
  return (days / cycleDays) * fee.amountRaw;
}

export function cancelFee(id: string): void {
  const fee = activeFees.find((f) => f.id === id);
  if (!fee) return;
  const now = new Date();
  const cancelledWhen = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
  const cancelledWhenISO = now.toISOString().slice(0, 10);
  const suffix = fee.cycle === "Monthly" ? "mo" : "yr";
  activeFees = activeFees.filter((f) => f.id !== id);
  cancelledFees = [
    {
      id: fee.id,
      name: fee.name,
      domain: fee.domain,
      wasDisplay: `${fee.amountDisplay}/${suffix}`,
      amountRaw: fee.amountRaw,
      currency: fee.currency,
      cycle: fee.cycle,
      cancelledWhen,
      cancelledWhenISO,
    },
    ...cancelledFees,
  ];
  notify();
  // TODO: persist to Supabase
}

export function deleteFee(id: string): void {
  activeFees = activeFees.filter((f) => f.id !== id);
  notify();
  // TODO: persist to Supabase
}

export function updateFee(id: string, patch: Partial<Fee>): void {
  activeFees = activeFees.map((f) => (f.id === id ? { ...f, ...patch } : f));
  notify();
  // TODO: persist to Supabase
}

export function addFee(fee: Omit<Fee, "id">): void {
  const id = String(Date.now());
  activeFees = [{ id, ...fee }, ...activeFees];
  notify();
  // TODO: persist to Supabase
}

export function annualCost(fee: Fee): number {
  return fee.cycle === "Monthly" ? fee.amountRaw * 12 : fee.amountRaw;
}

export function paidSoFar(fee: Fee): number {
  const added = new Date(fee.dateAddedISO);
  const now = new Date();
  const months =
    (now.getFullYear() - added.getFullYear()) * 12 +
    (now.getMonth() - added.getMonth());
  const cycleMonths = fee.cycle === "Monthly" ? 1 : 12;
  const payments = Math.max(1, Math.floor(months / cycleMonths));
  return fee.amountRaw * payments;
}

// ── Profile ───────────────────────────────────────────────────────────────────

export function useProfile(): Profile {
  return useSyncExternalStore(subscribe, () => _profile);
}

export function updateProfile(patch: Partial<Profile>): void {
  _profile = { ..._profile, ...patch };
  notify();
  // TODO: persist to Supabase / storage
}

// ── Settings ──────────────────────────────────────────────────────────────────

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, () => _settings);
}

export function updateSettings(patch: Partial<Settings>): void {
  _settings = { ..._settings, ...patch };
  notify();
  // TODO: persist to AsyncStorage / Supabase
}

// ── Pro ───────────────────────────────────────────────────────────────────────

export function useIsPro(): boolean {
  return useSyncExternalStore(subscribe, () => _isPro);
}

export function setIsPro(value: boolean): void {
  _isPro = value;
  notify();
  // TODO: verify receipt server-side before trusting
}

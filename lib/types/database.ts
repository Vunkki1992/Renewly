export type BillingCycle = "weekly" | "monthly" | "quarterly" | "yearly";
export type SubscriptionStatus = "active" | "cancelled" | "paused" | "trial";
export type InvoiceStatus = "pending" | "processing" | "processed" | "failed";
export type SubscriptionCategory =
  | "entertainment"
  | "productivity"
  | "utilities"
  | "finance"
  | "health"
  | "education"
  | "gaming"
  | "news"
  | "storage"
  | "other";

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  category: SubscriptionCategory;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  billing_cycle: BillingCycle;
  start_date: string;
  next_billing_date: string | null;
  cancelled_at: string | null;
  ai_detected: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  subscription_id: string | null;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  raw_text: string | null;
  ai_result: InvoiceAiResult | null;
  status: InvoiceStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceAiResult {
  name?: string;
  amount?: number;
  currency?: string;
  billing_cycle?: BillingCycle;
  next_billing_date?: string;
  category?: SubscriptionCategory;
  website_url?: string;
  description?: string;
  confidence: number;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string;
  invoice_id: string | null;
  amount: number;
  currency: string;
  payment_date: string;
  created_at: string;
}

export interface Biller {
  id: string;
  name: string;
  category: BillerCategory;
  logoUrl: string;
  fields: BillerField[];
}

export type BillerCategory =
  | 'utilities'
  | 'telecommunications'
  | 'government'
  | 'insurance'
  | 'credit-card'
  | 'loans';

export interface BillerField {
  name: string;
  label: string;
  type: 'text' | 'number';
  required: boolean;
  placeholder: string;
  validation?: {
    pattern: string;
    message: string;
  };
}

export interface PaymentRequest {
  billerId: string;
  accountId: string;
  amount: number;
  fields: Record<string, string>;
  notes: string;
}

export interface PaymentReceipt {
  id: string;
  reference: string;
  billerId: string;
  billerName: string;
  accountId: string;
  amount: number;
  fee: number;
  total: number;
  status: 'completed' | 'pending' | 'failed';
  paidAt: string;
}

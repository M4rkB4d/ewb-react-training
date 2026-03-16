import { create } from 'zustand';
import type { Biller, PaymentReceipt } from '../types';

type WizardStep = 'biller' | 'details' | 'review' | 'receipt';

interface PaymentDraft {
  step: WizardStep;
  biller: Biller | null;
  accountId: string;
  /** User input in pesos. Convert to centavos (* 100) before sending to API. */
  amount: number;
  fields: Record<string, string>;
  notes: string;
  receipt: PaymentReceipt | null;
}

interface PaymentDraftState extends PaymentDraft {
  setStep: (step: WizardStep) => void;
  setBiller: (biller: Biller) => void;
  setAccountId: (id: string) => void;
  setAmount: (amount: number) => void;
  setField: (name: string, value: string) => void;
  setNotes: (notes: string) => void;
  setReceipt: (receipt: PaymentReceipt) => void;
  reset: () => void;
}

const initialState: PaymentDraft = {
  step: 'biller',
  biller: null,
  accountId: '',
  amount: 0,
  fields: {},
  notes: '',
  receipt: null,
};

export const usePaymentDraftStore = create<PaymentDraftState>()((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setBiller: (biller) => set({ biller, step: 'details' }),
  setAccountId: (id) => set({ accountId: id }),
  setAmount: (amount) => set({ amount }),
  setField: (name, value) =>
    set((state) => ({ fields: { ...state.fields, [name]: value } })),
  setNotes: (notes) => set({ notes }),
  setReceipt: (receipt) => set({ receipt }),
  reset: () => set(initialState),
}));

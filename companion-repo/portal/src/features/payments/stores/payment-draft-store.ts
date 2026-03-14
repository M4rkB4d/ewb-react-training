import { create } from 'zustand';
import type { Biller } from '../types';

type WizardStep = 'biller' | 'details' | 'review' | 'receipt';

interface PaymentDraft {
  step: WizardStep;
  biller: Biller | null;
  accountId: string;
  amount: number;
  fields: Record<string, string>;
  notes: string;
}

interface PaymentDraftState extends PaymentDraft {
  setStep: (step: WizardStep) => void;
  setBiller: (biller: Biller) => void;
  setAccountId: (id: string) => void;
  setAmount: (amount: number) => void;
  setField: (name: string, value: string) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

const initialState: PaymentDraft = {
  step: 'biller',
  biller: null,
  accountId: '',
  amount: 0,
  fields: {},
  notes: '',
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
  reset: () => set(initialState),
}));

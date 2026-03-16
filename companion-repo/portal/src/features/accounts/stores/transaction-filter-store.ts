// src/features/accounts/stores/transaction-filter-store.ts
// Level 4 Exercise 1 — Transaction Filter Store (Zustand)
import { create } from 'zustand';

interface DateRange {
  start: string | null;
  end: string | null;
}

interface TransactionFilterState {
  transactionType: 'all' | 'credit' | 'debit';
  dateRange: DateRange;
  sortOrder: 'newest' | 'oldest' | 'amount-high' | 'amount-low';
  setTransactionType: (type: TransactionFilterState['transactionType']) => void;
  setDateRange: (range: DateRange) => void;
  setSortOrder: (order: TransactionFilterState['sortOrder']) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
}

const DEFAULTS = {
  transactionType: 'all' as const,
  dateRange: { start: null, end: null } as DateRange,
  sortOrder: 'newest' as const,
};

export const useTransactionFilterStore = create<TransactionFilterState>((set, get) => ({
  ...DEFAULTS,
  setTransactionType: (transactionType) => { set({ transactionType }); },
  setDateRange: (dateRange) => { set({ dateRange }); },
  setSortOrder: (sortOrder) => { set({ sortOrder }); },
  resetFilters: () => { set({ ...DEFAULTS }); },
  hasActiveFilters: () => {
    const state = get();
    return (
      state.transactionType !== 'all' ||
      state.dateRange.start !== null ||
      state.dateRange.end !== null ||
      state.sortOrder !== 'newest'
    );
  },
}));

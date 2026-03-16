// src/features/accounts/stores/account-filter-store.ts
import { create } from 'zustand';

interface AccountFilterState {
  accountType: 'all' | 'savings' | 'checking' | 'time-deposit';
  searchQuery: string;
  setAccountType: (type: AccountFilterState['accountType']) => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
  // Computed: are any filters active?
  hasActiveFilters: () => boolean;
}

export const useAccountFilterStore = create<AccountFilterState>((set, get) => ({
  accountType: 'all',
  searchQuery: '',
  setAccountType: (accountType) => { set({ accountType }); },
  setSearchQuery: (searchQuery) => { set({ searchQuery }); },
  reset: () => { set({ accountType: 'all', searchQuery: '' }); },
  hasActiveFilters: () => {
    const state = get();
    return state.accountType !== 'all' || state.searchQuery !== '';
  },
}));

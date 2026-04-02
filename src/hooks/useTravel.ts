import { create } from 'zustand';
import api from '@/lib/api';
import { TravelPackage } from '@/lib/index';

interface TravelState {
  packages: TravelPackage[];
  isLoading: boolean;
  error: string | null;
  fetchPackages: () => Promise<void>;
}

export const useTravel = create<TravelState>()((set) => ({
  packages: [],
  isLoading: true,
  error: null,
  fetchPackages: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/travel');
      set({ packages: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: typeof errorMsg === 'string' ? errorMsg : String(errorMsg), isLoading: false });
    }
  },
}));

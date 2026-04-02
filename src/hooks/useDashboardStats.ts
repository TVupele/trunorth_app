import { create } from 'zustand';
import api from '@/lib/api';

interface DashboardStats {
  unreadMessages: number;
  upcomingBookings: number;
}

interface DashboardStatsState {
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export const useDashboardStats = create<DashboardStatsState>()((set) => ({
  stats: {
    unreadMessages: 0,
    upcomingBookings: 0,
  },
  isLoading: true,
  error: null,
  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/dashboard/stats');
      set({ stats: response.data, isLoading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.error;
      set({ error: typeof errorMsg === 'string' ? errorMsg : 'Failed to fetch dashboard stats.', isLoading: false });
    }
  },
}));

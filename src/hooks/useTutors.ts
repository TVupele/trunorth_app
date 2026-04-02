import { create } from 'zustand';
import api from '@/lib/api';
import { Tutor } from '@/lib/index';

interface TutorsState {
  tutors: Tutor[];
  isLoading: boolean;
  error: string | null;
  fetchTutors: () => Promise<void>;
}

export const useTutors = create<TutorsState>()((set) => ({
  tutors: [],
  isLoading: true,
  error: null,
  fetchTutors: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/tutors');
      set({ tutors: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || error.message, isLoading: false });
    }
  },
}));

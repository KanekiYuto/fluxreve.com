import { create } from 'zustand';
import type { UserType } from '@/config/constants';

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  userType: UserType;
  createdAt: Date;
  updatedAt: Date;
  bannedAt?: Date;
  registrationCountry?: string;
}

interface UserStore {
  user: User | null;
  isLoading: boolean;
  quota: number | null; // 可用积分数量
  isQuotaLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setQuota: (quota: number | null) => void;
  setQuotaLoading: (loading: boolean) => void;
  fetchQuota: () => Promise<void>;
  clearUser: () => void;
}

const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  isLoading: true,
  quota: null,
  isQuotaLoading: false,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  setQuota: (quota) => set({ quota, isQuotaLoading: false }),
  setQuotaLoading: (loading) => set({ isQuotaLoading: loading }),
  fetchQuota: async () => {
    // 如果正在加载，避免重复请求
    if (get().isQuotaLoading) return;

    try {
      set({ isQuotaLoading: true });
      const response = await fetch('/api/quota/total');

      if (!response.ok) {
        console.error('Failed to fetch quota');
        set({ isQuotaLoading: false });
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        set({
          quota: result.data.totalAvailable ?? 0,
          isQuotaLoading: false,
        });
      } else {
        console.error('Invalid response format');
        set({ isQuotaLoading: false });
      }
    } catch (error) {
      console.error('Error fetching quota:', error);
      set({ isQuotaLoading: false });
    }
  },
  clearUser: () => set({ user: null, isLoading: false, quota: null }),
}));

export default useUserStore;

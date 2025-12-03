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
}

interface QuotaInfo {
  available: number; // -1 表示无限
  expiresAt: Date | null;
}

interface UserStore {
  user: User | null;
  isLoading: boolean;
  quotaInfo: QuotaInfo | null;
  isQuotaLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setQuotaInfo: (quota: QuotaInfo | null) => void;
  setQuotaLoading: (loading: boolean) => void;
  clearUser: () => void;
}

const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: true,
  quotaInfo: null,
  isQuotaLoading: false,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  setQuotaInfo: (quota) => set({ quotaInfo: quota, isQuotaLoading: false }),
  setQuotaLoading: (loading) => set({ isQuotaLoading: loading }),
  clearUser: () => set({ user: null, isLoading: false, quotaInfo: null }),
}));

export default useUserStore;

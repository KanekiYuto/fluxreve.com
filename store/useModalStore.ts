import { create } from 'zustand';

interface ModalStore {
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;

  subscriptionModalOpen: boolean;
  openSubscriptionModal: () => void;
  closeSubscriptionModal: () => void;
}

const useModalStore = create<ModalStore>((set) => ({
  loginModalOpen: false,
  openLoginModal: () => set({ loginModalOpen: true }),
  closeLoginModal: () => set({ loginModalOpen: false }),

  subscriptionModalOpen: false,
  openSubscriptionModal: () => set({ subscriptionModalOpen: true }),
  closeSubscriptionModal: () => set({ subscriptionModalOpen: false }),
}));

export default useModalStore;

'use client';

import LoginModal from '@/components/auth/LoginModal';
import useModalStore from '@/store/useModalStore';

export default function ModalProvider() {
  const { loginModalOpen, closeLoginModal } = useModalStore();

  return (
    <>
      <LoginModal isOpen={loginModalOpen} onClose={closeLoginModal} />
    </>
  );
}

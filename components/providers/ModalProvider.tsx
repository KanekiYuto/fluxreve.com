'use client';

import LoginModal from '@/components/auth/LoginModal';
import ImagePreviewModal from '@/components/common/ImagePreviewModal';
import LoraModal from '@/components/ai-generator/base/LoraModal';
import useModalStore from '@/store/useModalStore';

export default function ModalProvider() {
  const { loginModalOpen, closeLoginModal } = useModalStore();

  return (
    <>
      <LoginModal isOpen={loginModalOpen} onClose={closeLoginModal} />
      <ImagePreviewModal />
      <LoraModal />
    </>
  );
}

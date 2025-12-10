'use client';

import LoginModal from '@/components/auth/LoginModal';
import ImagePreviewModal from '@/components/common/ImagePreviewModal';
import LoraModal from '@/components/ai-generator/base/LoraModal';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import useModalStore from '@/store/useModalStore';

export default function ModalProvider() {
  const {
    loginModalOpen,
    closeLoginModal,
    subscriptionModalOpen,
    closeSubscriptionModal
  } = useModalStore();

  return (
    <>
      <LoginModal isOpen={loginModalOpen} onClose={closeLoginModal} />
      <SubscriptionModal isOpen={subscriptionModalOpen} onClose={closeSubscriptionModal} />
      <ImagePreviewModal />
      <LoraModal />
    </>
  );
}

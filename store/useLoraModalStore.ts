import { create } from 'zustand';
import { LoraConfig } from '@/components/ai-generator/base/LoraSelector';

interface LoraModalStore {
  // Modal 状态
  isOpen: boolean;

  // 当前模型（用于加载对应的 LoRA 列表）
  currentModel: string | null;

  // 当前选中的 LoRA 配置
  selectedLoras: LoraConfig[];

  // 临时选中的 LoRA（用于在 modal 中编辑，确认后才更新到 selectedLoras）
  tempSelectedLoras: LoraConfig[];

  // 回调函数（确认选择后调用）
  onConfirm: ((loras: LoraConfig[]) => void) | null;

  // 打开 Modal
  open: (model: string, currentLoras: LoraConfig[], onConfirm: (loras: LoraConfig[]) => void) => void;

  // 关闭 Modal
  close: () => void;

  // 更新临时选中的 LoRA
  setTempLoras: (loras: LoraConfig[]) => void;

  // 确认选择
  confirm: () => void;

  // 取消选择（恢复到打开前的状态）
  cancel: () => void;
}

const useLoraModalStore = create<LoraModalStore>((set, get) => ({
  isOpen: false,
  currentModel: null,
  selectedLoras: [],
  tempSelectedLoras: [],
  onConfirm: null,

  open: (model, currentLoras, onConfirm) => {
    set({
      isOpen: true,
      currentModel: model,
      selectedLoras: currentLoras,
      tempSelectedLoras: [...currentLoras], // 复制当前选择作为临时选择
      onConfirm,
    });
  },

  close: () => {
    set({
      isOpen: false,
      currentModel: null,
      selectedLoras: [],
      tempSelectedLoras: [],
      onConfirm: null,
    });
  },

  setTempLoras: (loras) => {
    set({ tempSelectedLoras: loras });
  },

  confirm: () => {
    const { tempSelectedLoras, onConfirm } = get();
    if (onConfirm) {
      onConfirm(tempSelectedLoras);
    }
    get().close();
  },

  cancel: () => {
    get().close();
  },
}));

export default useLoraModalStore;

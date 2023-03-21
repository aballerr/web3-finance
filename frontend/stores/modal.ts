import create from "zustand";
import { devtools } from "zustand/middleware";

export enum ModalContent {
  none,
  filterSave,
  removeFilter,
  updateFilter,
  walletSelect,
  walletName,
  resetImportFlow,
  scanWalletAddress,
  removeCategory,
  removeFile,
  previewFile,
}

interface State {
  modalContent: ModalContent;
  setModalContent: (modalContent: ModalContent) => void;
}

const useModal = create<State>()(
  devtools(
    (set) => ({
      modalContent: ModalContent.none,
      setModalContent: (modalContent) => set(() => ({ modalContent })),
    }),
    { name: "useModal" }
  )
);

export default useModal;

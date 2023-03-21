import { Portal } from "components/Portal";
import { useOnClickOutside } from "hooks/useOnClickOutside";
import { useRef } from "react";
import useModal, { ModalContent } from "stores/modal";

import FilterSave from "./FilterSave";
import PreviewFile from "./PreviewFile";
import RemoveCategory from "./RemoveCategory";
import RemoveFilter from "./RemoveFilter";
import RemoveUserFile from "./RemoveUserFile";
import ResetImportFlow from "./ResetImportFlow";
import ScanWalletAddress from "./ScanWalletAddress";
import UpdateFilter from "./UpdateFilter";
import WalletName from "./WalletName";
import WalletSelect from "./WalletSelect";

const Content = () => {
  const modalContent = useModal((state) => state.modalContent);

  switch (modalContent) {
    case ModalContent.walletSelect:
      return <WalletSelect />;
    case ModalContent.walletName:
      return <WalletName />;
    case ModalContent.resetImportFlow:
      return <ResetImportFlow />;
    case ModalContent.scanWalletAddress:
      return <ScanWalletAddress />;
    case ModalContent.removeCategory:
      return <RemoveCategory />;
    case ModalContent.filterSave:
      return <FilterSave />;
    case ModalContent.updateFilter:
      return <UpdateFilter />;
    case ModalContent.removeFilter:
      return <RemoveFilter />;
    case ModalContent.removeFile:
      return <RemoveUserFile />;
    case ModalContent.previewFile:
      return <PreviewFile />;
    default:
      return null;
  }
};

const Modal = () => {
  const modalContent = useModal((state) => state.modalContent);
  const setModalContent = useModal((state) => state.setModalContent);
  const walletRef = useRef(null);

  useOnClickOutside(walletRef, () => setModalContent(ModalContent.none));

  return modalContent === ModalContent.none ? null : (
    <Portal>
      <div className="fixed inset-0 z-70 bg-modal flex items-center justify-center">
        <div ref={walletRef}>
          <Content />
        </div>
      </div>
    </Portal>
  );
};

export default Modal;

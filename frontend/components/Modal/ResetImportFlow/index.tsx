import safeIconYellow from "assets/images/svgs/safeIconYellow.svg";
import { DefaultButton, PrimaryButton } from "components/Buttons";
import Image from "next/image";
import { X } from "react-feather";
import useModal, { ModalContent } from "stores/modal";
import useUserSafes from "stores/useUserSafesSetup";

const ResetImportFlow = () => {
  const reset = useUserSafes((state) => state.reset);
  const setModalContent = useModal((state) => state.setModalContent);

  return (
    <div className="bg-white p-24px rounded-12px w-400px">
      <div className="flex justify-between">
        <div className="h-56px w-56px bg-warning-50 flex items-center justify-center rounded-full">
          <div className="h-40px w-40px bg-warning-100 flex items-center justify-center rounded-full">
            <Image src={safeIconYellow} alt="safe icon" />
          </div>
        </div>
        <div
          onClick={() => setModalContent(ModalContent.none)}
          className="mt-8px text-gray-500 cursor-pointer"
        >
          <X size={26} />
        </div>
      </div>

      <div className="text-gray-900 font-semibold text-18px mt-20px">
        Do you want to stop importing Safe?
      </div>
      <div className="text-14px text-gray-600 mb-32px mt-8px">
        Import progress will be lost.
      </div>

      <div className="flex justify-between">
        <DefaultButton
          onClick={() => {
            reset();
            setModalContent(ModalContent.none);
          }}
          className="w-168px"
        >
          Stop
        </DefaultButton>
        <PrimaryButton
          onClick={() => setModalContent(ModalContent.none)}
          className="w-168px"
        >
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
};

export default ResetImportFlow;

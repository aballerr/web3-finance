import createNewSafeIcon from "assets/images/svgs/createNewSafeIcon.svg";
import importSafeIcon from "assets/images/svgs/importSafeIcon.svg";
import { DefaultButton } from "components/Buttons";
import Image from "next/image";
import { useEffect } from "react";
import useUserSafes from "stores/useUserSafesSetup";

const ImportOrCreateOption = ({
  iconSrc,
  title,
  description,
  setStep,
}: {
  iconSrc: string;
  title: string;
  description: string;
  setStep: () => void;
}) => {
  return (
    <div
      onClick={setStep}
      className="flex mt-20px shadow-lg rounded-12px cursor-pointer"
    >
      <div className="flex justify-center bg-primary-50 py-24px px-56px rounded-l-12px w-184px">
        <Image src={iconSrc} alt="import-safe" />
      </div>
      <div className="bg-white flex-1 p-24px rounded-r-12px">
        <div className="font-Medium text-16px text-gray-900">{title}</div>
        <div className="text-gray-600 text-14px mt-12px">{description}</div>
      </div>
    </div>
  );
};

const ConnectOrCreate = () => {
  const setStep = useUserSafes((state) => state.nextStep);
  const setIsCreating = useUserSafes((state) => state.setIsCreating);
  const setSafes = useUserSafes((state) => state.setSafes);
  const backStep = useUserSafes((state) => state.backStep);

  useEffect(() => {
    setIsCreating(false);
    setSafes([]);
  }, [setIsCreating, setSafes]);

  return (
    <div className="flex justify-center flex-col">
      <div className="w-560px">
        <div className="text-gray-900 text-24px">Link Safe</div>

        <ImportOrCreateOption
          iconSrc={importSafeIcon}
          title="Import existing Safe"
          description="Select from your existing Safe if you already have one in mind."
          setStep={setStep}
        />
        <ImportOrCreateOption
          iconSrc={createNewSafeIcon}
          title="Create new Safe"
          description="Create a new Safe if you are ready to take your on-chain corporate treasury game to the next level."
          setStep={() => {
            setIsCreating(true);
            setStep();
          }}
        />
      </div>

      <DefaultButton className="mt-20px w-160px ml-auto" onClick={backStep}>
        Back
      </DefaultButton>
    </div>
  );
};

export default ConnectOrCreate;

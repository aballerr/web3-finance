import { DefaultButton, PrimaryButton } from "components/Buttons";
import { SemiBold } from "components/Text";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "react-feather";
import useUserSafes from "stores/useUserSafesSetup";
import { pluralize } from "utils";
import { getTransition } from "utils/styles";

const NumberOfOwners = () => {
  const owners = useUserSafes((state) => state.owners);
  const backStep = useUserSafes((state) => state.backStep);
  const nextStep = useUserSafes((state) => state.nextStep);
  const safeCreate = useUserSafes((state) => state.safeCreate);
  const setSafeCreate = useUserSafes((state) => state.setSafeCreate);
  const [isOpen, setIsOpen] = useState(false);
  const [numOwners, setNumOwners] = useState(1);
  const hover = getTransition("hover:bg-gray-50");

  const length = owners.length;
  const ownersText = pluralize("owner", length);

  return (
    <div className="w-500px">
      <SemiBold className="text-gray-900">
        How many owners are required to sign?
      </SemiBold>
      <div className="text-gray-700 font-Medium text-14px">
        Any transaction requires the confirmation of:
      </div>
      <div className="mt-16px">
        <div className="position-relative">
          <div className="flex items-center">
            <div
              onClick={() => setIsOpen(!isOpen)}
              className={`${hover} cursor-pointer flex flex-row items-center border-1px border-gray-300 rounded-6px select-none w-40px py-8px px-12px w-80px`}
            >
              <span className="ml-0"> {numOwners}</span>
              <span className="ml-auto">
                {isOpen ? (
                  <ChevronUp size={20} className="text-gray-700" />
                ) : (
                  <ChevronDown size={20} className="text-gray-700" />
                )}
              </span>
            </div>
            <span
              className={`ml-20px text-gray-700 font-Medium text-14px cursor-pointer ${hover}`}
            >
              out of {length} {ownersText}
            </span>
          </div>
          <div className="flex gap-2 float-right mt-40px">
            <DefaultButton className="w-160px" onClick={backStep}>
              Back
            </DefaultButton>
            <PrimaryButton
              className="w-160px"
              onClick={() => {
                nextStep();
                safeCreate.threshhold = numOwners;
                setSafeCreate(safeCreate);
              }}
            >
              Continue
            </PrimaryButton>
          </div>
          <div className="position-absolute w-80px shadow-lg cursor-pointer">
            {isOpen &&
              owners.map((val, index) => (
                <div
                  className={`pl-12px cursor-pointer w-80px py-8px border-b-1px border-gray-300 ${hover}`}
                  key={index}
                  onClick={() => {
                    setNumOwners(index + 1);
                    setIsOpen(false);
                  }}
                >
                  {index + 1}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberOfOwners;

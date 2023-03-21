import { DefaultButton, PrimaryButton } from "components/Buttons";
import ChainSwitcher from "components/NavBar/ChainSwitcher";
import { SemiBold } from "components/Text";
import useUserSafes from "stores/useUserSafesSetup";

const NetworkSelect = () => {
  const nextStep = useUserSafes((state) => state.nextStep);
  const backStep = useUserSafes((state) => state.backStep);

  return (
    <div>
      <SemiBold className="text-gray-900">Select network</SemiBold>
      <div className="text-gray-600 mb-32px">
        You are about to create a Safe on this network. The network cannot be
        changed later.
      </div>
      <ChainSwitcher fullWidth />
      <div className="flex float-right gap-4 mt-32px">
        <DefaultButton className="text-gray-700 w-160px" onClick={backStep}>
          Back
        </DefaultButton>
        <PrimaryButton className="w-160px" onClick={nextStep}>
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
};

export default NetworkSelect;

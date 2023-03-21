import type { NextPage } from "next";
import useUserSafes from "stores/useUserSafesSetup";

import CreateSafe from "./components/create/CreateSafe";
import NetworkSelect from "./components/create/NetworkSelect";
import NumberOfOwners from "./components/create/NumberOfOwners";
import SafeNaming from "./components/create/SafeNaming";
import SafeOwners from "./components/create/SafeOwners";
import SafesCreated from "./components/create/SafesCreated";
import ConnectOrCreate from "./components/CreateOrConnect";
import ReviewSafes from "./components/import/ReviewSafes";
import SafeSelect from "./components/import/SafeSelect";
import Stepper from "./components/Stepper";
import WalletConnect from "./components/WalletConnect";
import WalletName from "./components/WalletName";

const getComponent = (step: number, isCreating: boolean) => {
  if (isCreating) {
    switch (step) {
      case 0:
        return WalletConnect;
      case 1:
        return WalletName;
      case 2:
        return ConnectOrCreate;
      case 3:
        return NetworkSelect;
      case 4:
        return SafeNaming;
      case 5:
        return SafeOwners;
      case 6:
        return NumberOfOwners;
      case 7:
        return CreateSafe;
      default:
        return SafesCreated;
    }
  } else {
    switch (step) {
      case 0:
        return WalletConnect;
      case 1:
        return WalletName;
      case 2:
        return ConnectOrCreate;
      case 3:
        return SafeSelect;
      default:
        return ReviewSafes;
    }
  }
};

const Safes: NextPage = () => {
  const step = useUserSafes((state) => state.step);
  const isCreating = useUserSafes((state) => state.isCreating);
  const StepComponent = getComponent(step, isCreating);

  return (
    <div className="flex">
      <Stepper />
      <div
        style={{
          transform: "translateX(-50%)",
        }}
        className="absolute left-1/2  flex justify-center items-center flex-col mt-52px"
      >
        <StepComponent />
      </div>
    </div>
  );
};

export default Safes;

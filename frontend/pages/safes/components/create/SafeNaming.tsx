import { DefaultButton, PrimaryButton } from "components/Buttons";
import { useMemo } from "react";
import useUserSafes from "stores/useUserSafesSetup";

const SafeNaming = () => {
  const nextStep = useUserSafes((state) => state.nextStep);
  const backStep = useUserSafes((state) => state.backStep);
  const safeCreate = useUserSafes((state) => state.safeCreate);
  const setSafeCreate = useUserSafes((state) => state.setSafeCreate);

  const isDisabled = useMemo(() => safeCreate.safeName === "", [safeCreate]);

  return (
    <div>
      <div className="text-24px text-gray-900 font-semibold">
        What would you like to name the Safe?
      </div>
      <div className="mt-40px">
        <div className="text-gray-700 font-Medium text-14px">Safe name</div>
        <input
          onChange={(e) => {
            setSafeCreate({ ...safeCreate, safeName: e.target.value });
          }}
          value={safeCreate.safeName}
          className="border-1px border-gray-300 outline-none w-full py-8px px-12px mt-12px"
        />
      </div>
      <div className="flex float-right gap-4 mt-32px">
        <DefaultButton className="text-gray-700 w-160px" onClick={backStep}>
          Back
        </DefaultButton>
        <PrimaryButton
          disabled={isDisabled}
          className="w-160px"
          onClick={nextStep}
        >
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
};

export default SafeNaming;

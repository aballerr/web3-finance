import Banner from "components/Banner";
import { DefaultButton } from "components/Buttons";
import { SemiBold } from "components/Text";
import { Plus } from "react-feather";
import useUserSafes from "stores/useUserSafesSetup";
import { authPost } from "utils/fetch-wrapper";
import { getTransition } from "utils/styles";

import { SafeReview } from "../import/ReviewSafes";

const SafesCreated = () => {
  const reset = useUserSafes((state) => state.reset);
  const safes = useUserSafes((state) => state.safes);
  const setOriginalImportComplete = useUserSafes(
    (state) => state.setOriginalImportComplete
  );
  const textHover = getTransition("hover:text-primary-800");

  return (
    <div>
      <Banner
        header="Successfully Create a Safe 🎉"
        body="Congrats! One more step towards on-chain treasury excellence."
        success
      />
      <div className="font-bold text-24px text-gray-900 flex items-center gap-4 mt-20px">
        <SemiBold className="text-gray-900">Safes Created</SemiBold>{" "}
        <span className="flex items-center justify-center bg-gray-100 text-gray-700 rounded-full py-2px px-8px text-12px">
          {safes?.length}
        </span>
      </div>
      <div className="max-h-300px overflow-y-scroll">
        {safes.map((safe) => (
          <SafeReview key={safe.address} safe={safe} />
        ))}
      </div>

      <div className="flex justify-center space-between mt-20px">
        <button
          className={`flex items-center justify-center font-medium text-20px ${textHover} text-primary-700 w-160px ml-auto mr-auto`}
          onClick={() => {
            setOriginalImportComplete(true);
            reset();
          }}
        >
          <Plus />
          <span className="ml-12px text-16px w-200px">Create Another Safe</span>
        </button>
      </div>

      <DefaultButton
        className="ml-auto"
        onClick={() => {
          authPost({
            url: "user/complete-flow",
            body: JSON.stringify({}),
          }).then((response) => {
            if (response.success) {
              window.location.pathname = "/";
            }
          });
        }}
      >
        Finish
      </DefaultButton>
    </div>
  );
};

export default SafesCreated;

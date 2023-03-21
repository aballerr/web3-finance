import Banner from "components/Banner";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Plus,
} from "react-feather";
import useUserSafes from "stores/useUserSafesSetup";
import { GnosisSafeInfoResponse } from "types";
import { authPost } from "utils/fetch-wrapper";
import { getTransition } from "utils/styles";

export const SafeReview = ({ safe }: { safe: GnosisSafeInfoResponse }) => {
  const [isOpen, setIsOpen] = useState(false);

  const borderStyling = isOpen ? "border-b-1px border-gray-200" : "";
  const ownersText = safe.owners.length === 1 ? " owner" : " owners";
  const { owners } = safe;

  return (
    <div className="border-1px border-gray-200 mt-12px rounded-8px w-696px">
      <div onClick={() => setIsOpen(!isOpen)} className={borderStyling}>
        <div className="flex cursor-pointer justify-between ml-24px mr-28px py-16px font-semibold text-18px">
          {safe.address} {isOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
      </div>

      {isOpen && (
        <div className="ml-24px mr-28px mt-36px pb-48px">
          <div className="flex">
            <span className="text-gray-400">Safe Name</span>{" "}
            <span className="ml-200px font-Medium text-gray-900 text-14px">
              {safe.gnosisSafeName ? safe.gnosisSafeName : "content"}
            </span>
          </div>
          <div className="flex mt-16px">
            <span className="text-gray-400">Signing Policy</span>{" "}
            <span className="font-Medium ml-176px text-gray-900 text-14px">
              {safe.threshold} out of {safe.owners.length}
              {ownersText}
            </span>
          </div>
          <div className="mt-48px text-18px font-bold text-gray-900 pb-20px">
            Owner details{" "}
          </div>
          <div className="h-1px bg-gray-200 w-full"> </div>
          <table className="w-full mt-36px">
            <thead>
              <tr className="text-left border-b-1px border-gray-200 ">
                <th className="pb-12px">OWNER NAME</th>
                <th className="pb-12px">ADDRESS</th>
              </tr>
            </thead>

            <tbody>
              {owners.map((owner, index) => {
                return (
                  <tr
                    key={owner.ownerAddress}
                    className="text-left pt-20px border-b-1px border-gray-200"
                  >
                    <td className="py-20px font-bold">
                      {owner.ownerName ? owner.ownerName : `Owner ${index}`}
                    </td>
                    <td className="py-20px flex gap-3">
                      <>
                        {owner.ownerAddress}{" "}
                        <Copy
                          className="cursor-pointer"
                          onClick={() =>
                            navigator.clipboard.writeText(safe.address)
                          }
                          color="#344054"
                        />{" "}
                        <ExternalLink
                          className="cursor-pointer"
                          color="#344054"
                          onClick={() => {
                            const baseURL =
                              safe.network === "mainnet"
                                ? "https://etherscan.io"
                                : "https://polygonscan.com";
                            const url = `${baseURL}/address/${safe.address}`;

                            window.open(url, "_blank");
                          }}
                        />
                      </>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ReviewSafes = () => {
  const safes = useUserSafes((state) => state.safes);
  const reset = useUserSafes((state) => state.reset);
  const setOriginalImportComplete = useUserSafes(
    (state) => state.setOriginalImportComplete
  );
  const selectedSafes = safes.filter((safe) => safe.isActive);
  const hover = getTransition("hover:bg-gray-50");
  const textHover = getTransition("hover:text-primary-800");

  const submit = () => {
    authPost({ url: "user/complete-flow", body: JSON.stringify({}) }).then(
      (response) => {
        if (response.success) {
          window.location.pathname = "/";
        }
      }
    );
  };

  return (
    <div>
      <Banner
        header="Successfully imported Safe 🎉"
        body="Congrats! One more step towards on-chain treasury excellence."
        success
      />
      <div className="font-bold text-24px text-gray-900 flex items-center gap-4 mt-20px">
        Safes Imported{" "}
        <span className="flex items-center justify-center bg-gray-100 text-gray-700 rounded-full py-2px px-8px text-12px">
          {selectedSafes.length}
        </span>
      </div>
      <div className="max-h-300px overflow-y-scroll">
        {selectedSafes.map((safe) => (
          <SafeReview key={safe.address} safe={safe} />
        ))}
      </div>
      <button
        className={`flex items-center justify-center font-medium w-200px text-20px ${textHover} text-primary-700 mt-40px w-160px ml-auto mr-auto`}
        onClick={() => {
          setOriginalImportComplete(true);
          reset();
        }}
      >
        <Plus />
        <span className="ml-12px text-16px">Import Another Safe</span>
      </button>
      <div
        className={`mt-20px ml-auto text-gray-700 font-semibold w-148px border-1px border-gray-300 py-12px rounded-6px cursor-pointer flex items-center justify-center ${hover}`}
        onClick={submit}
      >
        Finish
      </div>
    </div>
  );
};

export default ReviewSafes;

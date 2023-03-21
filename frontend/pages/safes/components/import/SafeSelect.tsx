import { useWeb3React } from "@web3-react/core";
import SafeIcon from "assets/images/svgs/gnosisIcon40.svg";
import LockIcon from "assets/images/svgs/lockIcon.svg";
import { DefaultButton, PrimaryButton } from "components/Buttons";
import { Checkmark } from "components/Icons";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Check } from "react-feather";
import BeatLoader from "react-spinners/BeatLoader";
import useUserSafes from "stores/useUserSafesSetup";
import { GnosisSafeInfoResponse } from "types";
import { authGet, authPost } from "utils/fetch-wrapper";
import { getTransition } from "utils/styles";

interface SafeProps {
  safe: GnosisSafeInfoResponse;
}

const CheckBox = ({ isChecked }: { isChecked: boolean }) => {
  const backgroundColor = isChecked ? "bg-primary-600" : undefined;
  const borderColor = isChecked ? "boder-primary-600" : "border-gray-300";

  return (
    <div
      className={` w-20px h-20px rounded-full ${borderColor} border-1px ${backgroundColor} flex items-center justify-center`}
      style={{ marginLeft: "auto" }}
    >
      {isChecked && <Check color="white" size={14} strokeWidth={3.5} />}
    </div>
  );
};

const Safe = ({ safe }: SafeProps) => {
  const { address, network, owners } = safe;
  const isChecked = useMemo(() => {
    return !!safe.isActive;
  }, [safe.isActive]);

  const safes = useUserSafes((state) => state.safes);
  const setSafes = useUserSafes((state) => state.setSafes);
  const ownersText =
    owners.length === 1 ? `1 owner` : `${owners.length} owners`;

  const bgColor = isChecked ? "bg-primary-50" : "white";
  const bgHover = isChecked
    ? getTransition("hover:bg-primary-50")
    : getTransition("hover:bg-gray-200");
  const primaryTextColor = isChecked ? "text-primary-800" : "text-gray-700";
  const supportingTextColor = isChecked ? "text-primary-700" : "text-gray-600";
  const borderColor = isChecked ? "border-primary-600" : "border-gray-200";
  const dotBackground = isChecked ? "bg-primary-700" : "bg-gray-600";

  return (
    <div
      onClick={() => {
        safe.isActive = !safe.isActive;
        const finalSafes = safes.map((mSafe) =>
          mSafe.address === safe.address ? safe : mSafe
        );

        setSafes(finalSafes);
      }}
      className={`flex gap-2 ${bgColor} ${bgHover} ${borderColor} p-16px rounded-12px gap-16px cursor-pointer  border-1px mt-12px`}
    >
      <Image src={SafeIcon} alt="safe-icon" />
      <div>
        <div>
          <span className={`${primaryTextColor} font-Medium`}>
            {" "}
            Gnosis Safe{" "}
          </span>
          <span className={supportingTextColor}>
            {network}{" "}
            <div
              className={`${dotBackground} w-2px h-2px rounded-full inline-block mb-4px`}
            ></div>{" "}
            {ownersText}
          </span>
        </div>
        <div className={supportingTextColor}>{address}</div>
      </div>
      <div className="ml-auto">
        <CheckBox isChecked={safe.isActive === true} />
      </div>
    </div>
  );
};

interface Response {
  safes: Array<GnosisSafeInfoResponse>;
  checkedAccount: string;
}

interface SafeObj {
  [key: string]: boolean;
}

const SafeSelect = () => {
  const backStep = useUserSafes((state) => state.backStep);
  const nextStep = useUserSafes((state) => state.nextStep);
  const reset = useUserSafes((state) => state.reset);
  const safes = useUserSafes((state) => state.safes);
  const setSafes = useUserSafes((state) => state.setSafes);
  const orginalImportComplete = useUserSafes(
    (state) => state.orginalImportComplete
  );
  const { account } = useWeb3React();
  const [isLoading, setLoading] = useState(false);
  const [noSafes, setNoSafes] = useState(false);

  const shouldSelectAll = useMemo(() => {
    const safe = safes.find((safe) => safe.isActive !== true);

    return !!safe;
  }, [safes]);

  const existingSafes = useMemo(() => {
    const safeMap: SafeObj = {};

    safes.forEach((safe) => {
      safeMap[safe.address] = true;
    });

    return safeMap;
  }, [safes]);

  useEffect(() => {
    const getSafes = async () => {
      if (account && safes.length === 0) {
        setLoading(true);

        authGet({ url: `gnosis-safe/onboard/${account}` })
          .then((response: Response) => {
            const { safes, checkedAccount } = response;

            if (checkedAccount) return;

            if (safes.length === 0) {
              setNoSafes(true);
            } else {
              const final = safes.filter(
                (safe) => existingSafes[safe.address] !== true
              );
              setNoSafes(false);
              setSafes(final);
            }

            setLoading(false);
          })
          .catch((err) => {
            console.log(err);
            setLoading(false);
          });
      }
    };

    getSafes();

    // eslint-disable-next-line
  }, [account, setSafes, safes.length]);

  const importSafes = () => {
    authPost({
      url: "gnosis-safe/import",
      body: JSON.stringify({ safesToImport: safes }),
    }).then((response) => {
      if (response.success) {
        nextStep();
      }
    });
  };

  const canImport = useMemo(() => {
    for (const safe of safes) {
      if (safe.isActive) return true;
    }

    return false;
  }, [safes]);

  const textColor = shouldSelectAll ? "text-primary-700" : "text-gray-600";
  const hover = shouldSelectAll ? "hover:bg-primary-50" : "hover:bg-gray-50";
  const text = shouldSelectAll ? "Select All" : "Select None";

  return (
    <div style={{ width: 500 }}>
      <div className="font-bold text-24px mb-32px">
        {isLoading
          ? "We are loading your safes, this may take a minute..."
          : noSafes
          ? `We found no safes for this address: ${account}`
          : "Which Safe would you like to import?"}
      </div>
      <div className="max-h-400px overflow-y-auto">
        {isLoading && safes.length === 0 && (
          <>
            <div className="flex align-center">
              <BeatLoader className="ml-auto mr-auto mt-16px" color="#00CF9D" />{" "}
            </div>
          </>
        )}
        {safes.map((safe) => (
          <Safe key={safe.address} safe={safe} />
        ))}
      </div>
      {noSafes ? (
        <div>
          {" "}
          <button
            className={`flex w-full items-center justify-center border-1px border-gray-200 mt-20px text-primary-700 rounded py-12px hover:border-primary-50  disabled:bg-gray-300  disabled:text-white ${getTransition(
              "hover:bg-primary-50"
            )}`}
            onClick={() => {
              setSafes([]);
              reset();
            }}
          >
            Select a different wallet
          </button>{" "}
        </div>
      ) : (
        <div>
          {" "}
          <button
            className={`flex w-full items-center justify-center border-1px border-gray-200 mt-20px ${textColor} rounded py-12px hover:border-primary-50  disabled:bg-gray-300  disabled:text-white ${getTransition(
              hover
            )}`}
            disabled={safes.length === 0}
            onClick={() => {
              const allSafes = safes.map((safe) => {
                safe.isActive = shouldSelectAll;
                return safe;
              });

              setSafes(allSafes);
            }}
          >
            {shouldSelectAll && (
              <Checkmark color={safes.length == 0 ? "white" : undefined} />
            )}{" "}
            {text}
          </button>{" "}
        </div>
      )}

      <div className="mt-40px flex justify-end gap-12px">
        <DefaultButton className="w-180px" onClick={backStep}>
          Back
        </DefaultButton>
        <PrimaryButton
          className="flex gap-12px w-180px"
          onClick={importSafes}
          disabled={
            (safes.length === 0 || !canImport) && !orginalImportComplete
          }
        >
          {orginalImportComplete && !canImport ? (
            "Continue"
          ) : (
            <>
              {" "}
              <Image src={LockIcon} alt="lockIcon" />
              Import
            </>
          )}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default SafeSelect;

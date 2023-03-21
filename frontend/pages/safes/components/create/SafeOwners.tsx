import { useWeb3React } from "@web3-react/core";
import qrCodeIcon from "assets/images/svgs/qrCodeIcon.svg";
import { DefaultButton, PrimaryButton } from "components/Buttons";
import { Checkmark } from "components/Icons";
import { SemiBold } from "components/Text";
import { ethers } from "ethers";
import { useEffect, useMemo } from "react";
import { Plus, Trash2 } from "react-feather";
import useModal, { ModalContent } from "stores/modal";
import useUserSafes from "stores/useUserSafesSetup";
import { getTransition } from "utils/styles";

interface DuplicateMap {
  [key: string]: string;
}

const Owner = ({
  ownerKey,
  index,
  duplicateMap,
}: {
  ownerKey: string;
  index: number;
  duplicateMap: DuplicateMap;
}) => {
  const owners = useUserSafes((state) => state.owners);
  const setOwners = useUserSafes((state) => state.setOwners);
  const setModalContent = useModal((state) => state.setModalContent);
  const setOwnerScanningPosition = useUserSafes(
    (state) => state.setOwnerScanningPosition
  );
  const owner = owners.find((owner) => owner.key === ownerKey);
  const showError = useMemo(() => {
    if (!owner) return false;
    if (duplicateMap[owner?.address] === undefined) return false;

    return duplicateMap[owner?.address] !== owner.key;
  }, [duplicateMap, owner]);

  const isNotValid =
    owner && owner.address.length > 0 && !ethers.utils.isAddress(owner.address);

  return (
    <div className="flex gap-2 mt-24px">
      <div>
        <div className="font-Medium text-gray-700">Name</div>
        <input
          value={owner?.name}
          onChange={(e) => {
            if (owner) {
              owner.name = e.target.value;
              setOwners([...owners]);
            }
          }}
          disabled={index === 0}
          className="outline-none border-1px border-gray-300 py-8px px-12px"
        />
      </div>
      <div>
        <div className="font-Medium text-gray-700">Wallet Address</div>
        <div className="flex items-center">
          <div className="relative">
            <input
              value={owner?.address}
              onChange={(e) => {
                if (owner) {
                  owner.address = e.target.value;
                  setOwners([...owners]);
                }
              }}
              disabled={index === 0}
              className="outline-none border-1px border-gray-300 py-8px px-12px w-400px mr-12px"
            />
            {!isNotValid && owner?.address && (
              <Checkmark
                color="white"
                className="absolute top-0 right-0 bg-primary-700 right-12px"
                style={{
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
            )}
          </div>

          {index !== 0 && (
            <>
              <picture
                className="cursor-pointer"
                onClick={() => {
                  setOwnerScanningPosition(ownerKey);
                  setModalContent(ModalContent.scanWalletAddress);
                }}
              >
                <img src={qrCodeIcon.src} alt="qrcode" />
              </picture>
              <Trash2
                color="#475467"
                onClick={() => {
                  const newOwners = owners.filter(
                    (owner) => owner?.key !== ownerKey
                  );
                  setOwners(newOwners);
                }}
                className="cursor-pointer ml-16px"
              />
            </>
          )}
        </div>

        {isNotValid && (
          <div className="text-red-600 ml-12px">
            Error, you have an invalid address
          </div>
        )}
        {showError && (
          <div className="text-red-600 ml-12px">
            Error, you have a duplicate address
          </div>
        )}
      </div>
    </div>
  );
};

const SafeOwners = () => {
  const { account } = useWeb3React();
  const hover = getTransition("hover:text-primary-800");
  const owners = useUserSafes((state) => state.owners);
  const setOwners = useUserSafes((state) => state.setOwners);
  const backStep = useUserSafes((state) => state.backStep);
  const nextStep = useUserSafes((state) => state.nextStep);

  const isDisabled = useMemo(() => {
    return !!owners.find(
      (owner) => owner.address === "" || !ethers.utils.isAddress(owner.address)
    );
  }, [owners]);

  useEffect(() => {
    if (account && owners.length && owners[0].address !== account) {
      const owner = owners[0];
      owner.name = "me";
      owner.address = account;
      setOwners([...owners]);
    }
  }, [account, setOwners, owners]);

  const [duplicateMap, duplicateExists] = useMemo(() => {
    const map: DuplicateMap = {};
    let duplicateExists = false;

    for (let i = 0; i < owners.length; i++) {
      const { address, key } = owners[i];
      if (address && map[address] === undefined) map[address] = key;
      else if (address !== "") {
        duplicateExists = true;
      }
    }

    return [map, duplicateExists];
  }, [owners]);

  return (
    <div>
      <SemiBold className="text-gray-900">
        Who are the owners of the Safe
      </SemiBold>
      {owners.map((owner, index) => (
        <Owner
          duplicateMap={duplicateMap}
          key={owner.key}
          ownerKey={owner.key}
          index={index}
        />
      ))}

      <button
        className={`flex text-primary-700 font-semibold ml-auto mr-auto mt-32px ${hover}`}
        onClick={() => {
          const newOwners = [
            ...owners,
            { key: `${Math.random()}`, name: "", address: "" },
          ];

          setOwners(newOwners);
        }}
      >
        <Plus /> Add another owner
      </button>
      <div className="flex gap-2 float-right mt-40px">
        <DefaultButton className="w-160px" onClick={backStep}>
          Back
        </DefaultButton>
        <PrimaryButton
          disabled={!!isDisabled || duplicateExists}
          className="w-160px"
          onClick={nextStep}
        >
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
};

export default SafeOwners;

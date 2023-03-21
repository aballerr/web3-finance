import Safe, { SafeAccountConfig, SafeFactory } from "@gnosis.pm/safe-core-sdk";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import { useWeb3React } from "@web3-react/core";
import LockIcon from "assets/images/svgs/lockIcon.svg";
import { DefaultButton, PrimaryButton } from "components/Buttons";
import { SemiBold } from "components/Text";
import { ethers } from "ethers";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, ExternalLink } from "react-feather";
import ClipLoader from "react-spinners/ClipLoader";
import useUserSafes from "stores/useUserSafesSetup";
import { SafeCreateRequest } from "types";
import { authGet, authPost } from "utils/fetch-wrapper";
import { createPolygonSafes } from "utils/gnosis-safe-creation";

const CreateSafe = () => {
  const { chainId, provider, account } = useWeb3React();
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const safeParams = useUserSafes((state) => state.safeCreate);
  const owners = useUserSafes((state) => state.owners);
  const setSafes = useUserSafes((state) => state.setSafes);
  const borderStyling = isOpen ? "border-b-1px border-gray-200" : "";
  const nextStep = useUserSafes((state) => state.nextStep);
  const backStep = useUserSafes((state) => state.backStep);

  const CreateSafeInstance = async () => {
    if (account && chainId === 137) {
      setIsLoading(true);
      const address = await createPolygonSafes({ from: account, owners });

      const safeCreateRequest: SafeCreateRequest = {
        address: address,
        gnosisSafeName: safeParams.safeName,
        nonce: 0,
        threshold: safeParams.threshhold,
        owners: owners,
        masterCopy: "",
        modules: [],
        guard: "0x0000000000000000000000000000000000000000",
        version: "1.3.0",
        fallbackHandler: "",
        chainId: chainId ?? 0,
      };

      authPost({
        url: "gnosis-safe/create",
        body: JSON.stringify({ safeCreateRequest }),
      }).then(() => {
        authGet({ url: "gnosis-safe/created" }).then((success) => {
          setSafes(success.safes);
          setIsLoading(false);
          nextStep();
        });
      });
    } else if (provider) {
      const ownerAddress = owners.map((owner) => owner.address);
      const threshold = safeParams.threshhold;

      //   https: github.com/safe-global/safe-core-sdk/issues/128
      const safeOwner = provider.getSigner(0);
      const ethAdapter = new EthersAdapter({
        ethers,
        signer: safeOwner,
      });
      const safeFactory = await SafeFactory.create({
        ethAdapter,
      });

      const safeAccountConfig: SafeAccountConfig = {
        owners: ownerAddress,
        threshold,
      };

      try {
        setIsLoading(true);
        const safeSdk: Safe = await safeFactory.deploySafe({
          safeAccountConfig,
        });

        const safeCreateRequest: SafeCreateRequest = {
          address: await safeSdk.getAddress(),
          gnosisSafeName: safeParams.safeName,
          nonce: await safeSdk.getNonce(),
          threshold: await safeSdk.getThreshold(),
          owners: owners,
          masterCopy: "",
          modules: [],
          guard: await safeSdk.getGuard(),
          version: await safeSdk.getContractVersion(),
          fallbackHandler: "",
          chainId: chainId ?? 0,
        };

        authPost({
          url: "gnosis-safe/create",
          body: JSON.stringify({ safeCreateRequest }),
        }).then(() => {
          authGet({ url: "gnosis-safe/created" }).then((success) => {
            setSafes(success.safes);
            setIsLoading(false);
            nextStep();
          });
        });
      } catch (err) {
        setIsLoading(false);
        console.log(err);
        console.log("failed to create safe");
      }
    }
  };

  return (
    <div>
      <SemiBold className="text-gray-900">Create Safe</SemiBold>

      <div className="border-1px border-gray-200 mt-12px rounded-8px w-696px">
        <div onClick={() => setIsOpen(!isOpen)} className={borderStyling}>
          <div className="flex cursor-pointer justify-between ml-24px mr-28px py-16px font-semibold text-18px">
            {safeParams.safeName} {isOpen ? <ChevronUp /> : <ChevronDown />}
          </div>
        </div>

        {isOpen && (
          <div className="ml-24px mr-28px mt-36px pb-48px">
            <div className="flex">
              <span className="text-gray-400">Safe Name</span>{" "}
              <span className="ml-200px font-Medium text-gray-900 text-14px">
                {safeParams.safeName}
              </span>
            </div>
            <div className="flex mt-16px">
              <span className="text-gray-400">Signing Policy</span>{" "}
              <span className="font-Medium ml-176px text-gray-900 text-14px">
                {safeParams.threshhold} of {owners.length}
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
                {owners.map((owner) => {
                  return (
                    <tr
                      key={owner.key}
                      className="text-left pt-20px border-b-1px border-gray-200"
                    >
                      <td className="py-20px font-bold">{owner.name}</td>
                      <td className="py-20px flex gap-3">
                        {owner.address}{" "}
                        <Copy
                          className="cursor-pointer"
                          onClick={() =>
                            navigator.clipboard.writeText(owner.address)
                          }
                          color="#344054"
                        />{" "}
                        <ExternalLink
                          className="cursor-pointer"
                          color="#344054"
                          onClick={() => {
                            const baseURL =
                              chainId === 1
                                ? "https://etherscan.io"
                                : "https://polygonscan.com";
                            const url = `${baseURL}/address/${owner.address}`;

                            window.open(url, "_blank");
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-20px flex justify-end gap-12px">
        <DefaultButton onClick={() => backStep()}>Back</DefaultButton>
        <PrimaryButton
          onClick={() => {
            CreateSafeInstance();
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <ClipLoader color="#00CF9D" />
          ) : (
            <>
              <Image src={LockIcon} alt="lock" />
              <div className="ml-12px">Create Safe</div>
            </>
          )}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default CreateSafe;

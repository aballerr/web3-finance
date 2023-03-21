import { useWeb3React } from "@web3-react/core";
import { DefaultButton, PrimaryButton } from "components/Buttons";
import Image from "next/image";
import { useEffect, useState } from "react";
import useConnectorType, { ConnectorType } from "stores/connectorType";
import useUserSafes from "stores/useUserSafesSetup";
import { authGet, authPost } from "utils/fetch-wrapper";
import { getWalletSrc } from "utils/wallet";

const getWalletName = (connectorType: ConnectorType): string => {
  switch (connectorType) {
    case ConnectorType.Coinbase:
      return "Coinbase";
    case ConnectorType.MetaMask:
      return "MetaMask";
    case ConnectorType.WalletConnect:
      return "WalletConnect";
    default:
      return "";
  }
};

const WN = () => {
  const setStep = useUserSafes((state) => state.nextStep);
  const backStep = useUserSafes((state) => state.backStep);
  const connectorType = useConnectorType((state) => state.connectorType);
  const { account } = useWeb3React();
  const src = getWalletSrc(connectorType);
  const walletName = getWalletName(connectorType);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    if (account) {
      authGet({ url: `user/wallet/${account}` }).then((response) => {
        if (response.success && response.wallet) {
          const { wallet } = response;
          setTempName(wallet.walletName);
        }
      });
    }
  }, [account]);

  return (
    <div className="w-560px rounded-xl p-24px">
      <div className="text-20px text-gray-900 font-Medium">
        Give your wallet a Nickname{" "}
      </div>
      <div className="text-gray-600 mt-8px">
        This is only visible internally and won’t be shown outside of Base58.
      </div>
      <div className="mt-44px flex">
        {src && <Image src={src} alt="wallet" />}
        <span className="flex flex-col w-400px ml-12px">
          <span className="text-gray-700 font-bold w-400px">{walletName}</span>
          <span className="text-gray-600 w-400px">{account}</span>
        </span>
      </div>
      <div>
        <div className="text-gray-700 mt-44px">Nickname (optional)</div>
        <input
          placeholder="e.g. finance-eth"
          className="w-full border-1px outline-none px-12px py-8px leading-6 text-16px border-gray-300 mt-6px"
          value={tempName}
          onChange={(e) => {
            setTempName(e.target.value);
          }}
        />
      </div>
      <div className="mt-24px flex justify-between items-center">
        <span className="ml-auto flex gap-12px">
          <DefaultButton onClick={backStep}>back</DefaultButton>
          <PrimaryButton
            onClick={() => {
              const requestBody = {
                walletAddress: account,
                walletType: getWalletName(connectorType),
                walletName: tempName ?? "",
              };

              authPost({
                url: "user/wallet",
                body: JSON.stringify(requestBody),
              }).then((response) => {
                if (response.success) {
                  setStep();
                } else {
                  // TODO: handle errors
                  setStep();
                }
              });
            }}
          >
            Continue
          </PrimaryButton>
        </span>
      </div>
    </div>
  );
};

export default WN;

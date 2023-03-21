import { useWeb3React } from "@web3-react/core";
import safeIcon from "assets/images/svgs/safeIcon.svg";
import Image from "next/image";
import { useState } from "react";
import { X } from "react-feather";
import useConnectorType, { ConnectorType } from "stores/connectorType";
import useModal, { ModalContent } from "stores/modal";
import useUserSettings from "stores/userSettings";
import { authPost } from "utils/fetch-wrapper";
import { getTransition } from "utils/styles";
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
const saveTransition = getTransition("hover:bg-primary-700");
const cancelTransition = getTransition("hover:bg-gray-50");

const WalletName = () => {
  const setModalContent = useModal((state) => state.setModalContent);
  const connectorType = useConnectorType((state) => state.connectorType);
  const { account } = useWeb3React();
  const src = getWalletSrc(connectorType);
  const walletName = getWalletName(connectorType);
  const setShowNameWallet = useUserSettings((state) => state.setShowNameWallet);
  const setWalletNames = useUserSettings((state) => state.setWalletNames);
  // const setWalletName = useUserSettings((state) => state.setWalletName);
  const [tempName, setTempName] = useState("");

  return (
    <div
      className="w-560px rounded-xl p-24px"
      style={{ backgroundColor: "white" }}
    >
      <div className="flex justify-between">
        <Image src={safeIcon} alt="safe icon" />
        <X
          onClick={() => setModalContent(ModalContent.none)}
          className="text-gray-500 mt-4px cursor-pointer"
          size={24}
        />
      </div>

      <div className="text-20px text-gray-900 mt-20px font-semibold">
        Give your wallet a Nickname{" "}
        <span className="text-gray-300 font-normal">optional</span>
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
        <div className="text-gray-700 mt-44px">Nickname</div>
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
        <span>
          <input
            type="checkbox"
            onClick={(e) => {
              // @ts-ignore
              setShowNameWallet(!e.target.checked);
            }}
          />
          <span className="text-gray-700 ml-8px">Don&apos;t show again</span>
        </span>
        <span>
          <button
            onClick={() => setModalContent(ModalContent.none)}
            className={`text-gray-700 border-1px font-semibold py-12px px-20px rounded-md ${cancelTransition}`}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (account && tempName && connectorType) {
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
                    setWalletNames(response.wallets);
                    setModalContent(ModalContent.none);
                  }
                });
              }
            }}
            className={`bg-primary-600 text-white font-semibold py-12px px-20px rounded-md ml-12px hover:border-gray-300 ${saveTransition}`}
          >
            Save
          </button>
        </span>
      </div>
    </div>
  );
};

export default WalletName;

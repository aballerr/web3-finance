import { useWeb3React } from "@web3-react/core";
import coinbaseIcon from "assets/images/svgs/coinbaseIcon.svg";
import metaMaskIcon from "assets/images/svgs/metaMaskIcon.svg";
import safeIcon from "assets/images/svgs/safeIcon.svg";
import walletConnectIcon from "assets/images/svgs/walletConnectIcon.svg";
import {
  coinbaseConnector,
  metaMaskConnector,
  walletConnectConnector,
} from "constants/connectors";
import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "react-feather";
import useConnectorType, { ConnectorType } from "stores/connectorType";
import useModal, { ModalContent } from "stores/modal";
import useUserSettings from "stores/userSettings";
import { getTransition } from "utils/styles";

const transition = getTransition("hover:bg-gray-100");

const WalletOption = ({
  iconSrc,
  walletName,
  connect,
}: {
  iconSrc: string;
  walletName: string;
  connect: () => void;
}) => {
  return (
    <div
      onClick={connect}
      className={`flex items-center text-gray-700 cursor-pointer p-12px boder-rounded ${transition} rounded-xl`}
    >
      <Image width="30" height="30" src={iconSrc} alt="walletoption" />
      <span className="ml-12px font-semibold text-14px ">{walletName}</span>
    </div>
  );
};

const WalletSelect = () => {
  const { account } = useWeb3React();
  const setModalContent = useModal((state) => state.setModalContent);
  const setConnectorType = useConnectorType((state) => state.setConnectorType);
  const connectorType = useConnectorType((state) => state.connectorType);
  const walletNames = useUserSettings((state) => state.walletNames);
  const showNameWallet = useUserSettings((state) => state.showNameWallet);
  const setWalletName = useUserSettings((state) => state.setWalletName);
  const [metaMaskText, setMetaMaskText] = useState("MetaMask");
  const [coinbaseWallet] = coinbaseConnector;
  const [metamask] = metaMaskConnector;
  const [walletconnect] = walletConnectConnector;

  useEffect(() => {
    if (!window.ethereum) {
      setMetaMaskText("Install MetaMask");
    }
  }, []);

  useEffect(() => {
    if (account && connectorType) {
      const walletName = walletNames[account];

      // if (!walletName) setWalletName(account, connectorType);

      if (!walletName && showNameWallet) {
        setModalContent(ModalContent.walletName);
      } else {
        setModalContent(ModalContent.none);
      }
    }
  }, [
    account,
    connectorType,
    setWalletName,
    showNameWallet,
    walletNames,
    setModalContent,
  ]);

  return (
    <div
      className="w-400px h-360px rounded-xl p-24px"
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
      <div className="text-20px font-semibold text-gray-900 mt-20px">
        Connect a wallet to continue
      </div>
      <div className="mt-20px grid gap-y-8px">
        <WalletOption
          connect={() => {
            coinbaseWallet
              .activate()
              .then(() => {
                setConnectorType(ConnectorType.Coinbase);
              })
              .catch((err) => {
                console.log(err);
              });
          }}
          iconSrc={coinbaseIcon}
          walletName="Coinbase Wallet"
        />
        <a
          href={
            metaMaskText === "MetaMask" ? undefined : "https://metamask.io/"
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <WalletOption
            connect={() => {
              metamask
                .activate()
                .then(() => {
                  setConnectorType(ConnectorType.MetaMask);
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
            iconSrc={metaMaskIcon}
            walletName={metaMaskText}
          />
        </a>

        <WalletOption
          connect={() => {
            walletconnect
              .activate()
              .then(() => {
                setConnectorType(ConnectorType.WalletConnect);
              })
              .catch((err) => {
                console.log(err);
              });
          }}
          iconSrc={walletConnectIcon}
          walletName="WalletConnect"
        />
      </div>
    </div>
  );
};

export default WalletSelect;

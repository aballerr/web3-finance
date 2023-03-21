import { useWeb3React } from "@web3-react/core";
import iconSafePrimary600 from "assets/images/svgs/iconSafePrimary600.svg";
import sliderIcon from "assets/images/svgs/sliderIcon.svg";
import walletDisconnect from "assets/images/svgs/walletDisconnect.svg";
import {
  useActiveWalletConnector,
  useWalletConnector,
} from "hooks/useEagerlyConnect";
import { useOnClickOutside } from "hooks/useOnClickOutside";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "react-feather";
import useConnectorType, { ConnectorType } from "stores/connectorType";
import useUserSettings from "stores/userSettings";
import { shortenAddress } from "utils";
import { getWalletSrc } from "utils/wallet";

import { getTransition } from "../../../utils/styles";

const hover = getTransition("hover:bg-gray-50");

export const WalletStatus = ({
  imageSrc,
  isActive = false,
}: {
  imageSrc: string;
  isActive?: boolean;
}) => {
  const statusColor = isActive ? "bg-success-500" : "bg-error-500";

  return (
    <div className="relative w-20px h-20px">
      <Image src={imageSrc} alt="wallet" />
      <span
        style={{
          bottom: -1,
          right: -1,
        }}
        className={`inline-block absolute w-9px h-9px b--1px rounded-full ${statusColor} border-1.5px border-white`}
      ></span>
    </div>
  );
};

const Option = ({
  action,
  iconSrc,
  optionText,
  textColor,
}: {
  action: () => void;
  iconSrc: string;
  optionText: string;
  textColor: string;
}) => {
  return (
    <div
      className={`border-b-1px last:border-b-0 border-gray-300 px-20px w-208px font-semibold h-48px text-14px bg-white flex items-center cursor-pointer ${textColor} ${hover}`}
      style={{ width: 210 }}
      onClick={action}
    >
      <Image src={iconSrc} alt="icon" />
      <div className="ml-10px">{optionText}</div>
    </div>
  );
};

const WalletOption = ({
  address,
  connectorType,
  walletName,
}: {
  address: string;
  connectorType: ConnectorType;
  walletName: string;
}) => {
  const { connector: liveConnector } = useWeb3React();
  const name = walletName || shortenAddress(address);
  const walletSrc = getWalletSrc(connectorType);
  const connector = useWalletConnector(connectorType);
  const setConnector = useConnectorType((state) => state.setConnectorType);

  return (
    <div
      className={`border-b-1px border-gray-300 px-20px w-208px font-semibold w-212px h-48px text-14px bg-white flex items-center cursor-pointer ${hover}`}
      onClick={() => {
        try {
          liveConnector?.deactivate?.();
          liveConnector?.resetState?.();

          connector?.activate();
          setConnector(connectorType);
        } catch (err) {
          console.log("error");
        }
      }}
    >
      <WalletStatus imageSrc={walletSrc} />
      <div className="ml-8px text-gray-700">{name}</div>

      {/* <div className="ml-10px">{optionText}</div> */}
    </div>
  );
};

const useDisconnectedWallets = () => {
  const { account = "" } = useWeb3React();
  const walletNames = useUserSettings((state) => state.walletNames);

  const final = useMemo(() => {
    const entries = Object.entries(walletNames);
    const result = [];
    for (const [key, val] of entries) {
      if (key === account) continue;
      const walletInfo = { address: key, ...val };
      result.push(walletInfo);
    }

    return result;
  }, [account, walletNames]);

  return final;
};

const ConnectedButton = () => {
  const { account } = useWeb3React();
  const [isOpen, setIsOpen] = useState(false);
  const shortenedAddress = shortenAddress(account ?? "");
  const walletNames = useUserSettings((state) => state.walletNames);
  const walletName = walletNames[account ?? ""]?.walletName;
  const disconnectedWallets = useDisconnectedWallets();
  const connectorType = useConnectorType((state) => state.connectorType);
  const walletSrc = getWalletSrc(connectorType);
  const dropdownRef = useRef(null);

  const connector = useActiveWalletConnector();
  const setConnectorType = useConnectorType((state) => state.setConnectorType);

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  const disconnect = () => {
    try {
      connector?.deactivate?.();
      connector?.resetState?.();
      setConnectorType(ConnectorType.none);
    } catch (err) {
      console.log("error");
      console.log(err);
    }
  };

  return (
    <div className="relative select-none" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer border-gray-300 border-1px py-12px px-20px w-188px flex flex-row items-center rounded-30px ${hover}`}
      >
        <WalletStatus isActive imageSrc={walletSrc} />
        <div className="ml-8px text-gray-700">
          {walletName || shortenedAddress}
        </div>
        {isOpen ? (
          <ChevronUp size={20} className="ml-auto" />
        ) : (
          <ChevronDown size={20} className="ml-auto" />
        )}
      </div>
      {isOpen && (
        <div
          className="absolute animate-fadeIn shadow-lg"
          style={{ zIndex: 60 }}
        >
          {disconnectedWallets.map(({ address, connectorType, walletName }) => {
            return (
              <WalletOption
                key={address}
                walletName={walletName}
                connectorType={connectorType}
                address={address}
              />
            );
          })}
          <Option
            iconSrc={walletDisconnect}
            optionText="Disconnect"
            action={disconnect}
            textColor="text-gray-500"
          />
          <Option
            iconSrc={sliderIcon}
            optionText="Manage Wallets"
            action={() => true}
            textColor="text-gray-500"
          />
          <Option
            iconSrc={iconSafePrimary600}
            optionText="Connect new wallet"
            action={() => true}
            textColor="text-primary-600"
          />
        </div>
      )}
    </div>
  );
};

export default ConnectedButton;

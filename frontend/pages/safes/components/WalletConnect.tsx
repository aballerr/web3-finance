import { useWeb3React } from "@web3-react/core";
import coinbaseIcon from "assets/images/svgs/coinbaseIcon.svg";
import metaMaskIcon from "assets/images/svgs/metaMaskIcon.svg";
import walletConnectIcon from "assets/images/svgs/walletConnectIcon.svg";
import { PrimaryButton } from "components/Buttons";
import {
  coinbaseConnector,
  metaMaskConnector,
  walletConnectConnector,
} from "constants/connectors";
import { useActiveWalletConnector } from "hooks/useEagerlyConnect";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Plus } from "react-feather";
import useConnectorType, { ConnectorType } from "stores/connectorType";
import useUserSettings from "stores/userSettings";
import useUserSafes from "stores/useUserSafesSetup";
import { UserWallet } from "types";
import { shortenAddress } from "utils";
import { authGet } from "utils/fetch-wrapper";
import { getTransition } from "utils/styles";
import { getWalletSrc } from "utils/wallet";

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
      <Image src={iconSrc} alt="walletoption" />
      <span className="ml-12px font-Medium text-14px ">{walletName}</span>
    </div>
  );
};

interface UserInfoResponse {
  success: boolean;
  wallets: Array<UserWallet>;
}

const WalletConnect = () => {
  // @ts-ignore
  const { account } = useWeb3React();
  const setStep = useUserSafes((state) => state.nextStep);
  const setWalletName = useUserSettings((state) => state.setWalletName);
  const walletNames = useUserSettings((state) => state.walletNames);
  const [coinbaseWallet] = coinbaseConnector;
  const [metamask] = metaMaskConnector;
  const [walletconnect] = walletConnectConnector;
  const [metaMaskText, setMetaMaskText] = useState("MetaMask");
  const setConnectorType = useConnectorType((state) => state.setConnectorType);
  const connector = useActiveWalletConnector();

  const wallet = walletNames[account ?? ""];
  const walletName = walletNames[account ?? ""]?.walletName;

  const source = wallet ? getWalletSrc(wallet.connectorType) : "";

  useEffect(() => {
    if (!window.ethereum) {
      setMetaMaskText("Install MetaMask");
    }
  }, []);

  useEffect(() => {
    if (account) {
      authGet({ url: `user/info` }).then((response: UserInfoResponse) => {
        if (response.success && response.wallets) {
          for (const wallet of response.wallets) {
            setWalletName(wallet);
          }
        }
      });
    }
  }, [account, setWalletName]);

  const disconnect = () => {
    try {
      setConnectorType(ConnectorType.none);
      connector?.deactivate?.();
      connector?.resetState?.();
    } catch (err) {
      console.log("error");
      console.log(err);
    }
  };

  return account ? (
    <div className="w-500px">
      <div className="text-gray-900 text-24px font-semibold">
        Select a wallet to continue
      </div>
      <div className="text-gray-600 text-14px">
        If you have safes associated with a different wallet, simply connect the
        new wallet. Any previously imported safes have been saved and associated
        with your account.
      </div>
      <div
        className={`flex border-1px border-gray-300 ${getTransition(
          "hover:bg-gray-50"
        )} rounded-6px mt-32px p-16px cursor-pointer`}
      >
        {source && (
          <picture>
            <Image className="max-w-40px max-h-40px" src={source} alt="icon" />
          </picture>
        )}

        <div className="ml-20px">
          <div className="text-gray-900">
            {walletName ? (
              <div className="flex items-center gap-2">
                {walletName}{" "}
                <div className="w-4px h-4px rounded-full bg-gray-900"> </div>{" "}
                {shortenAddress(account)}{" "}
              </div>
            ) : (
              account
            )}{" "}
          </div>
          <div className="text-success-500">Connected</div>
        </div>
      </div>
      <div
        className={`flex items-center mt-32px cursor-pointer justify-center font-semibold text-primary-700 ${getTransition(
          "hover:text-primary-800"
        )}`}
        onClick={disconnect}
      >
        <Plus size={16} /> Connect a different wallet
      </div>

      <PrimaryButton
        onClick={() => {
          setStep();
        }}
        className="mt-32px float-right"
      >
        Continue
      </PrimaryButton>
    </div>
  ) : (
    <div>
      <div className="text-gray-900 text-24px tracking-wide">
        Connect a wallet to continue
      </div>
      <div className="text-gray-600 text-14px tracking-wide text-14px mt-8px">
        Be sure to select the wallet you have used to sign the Safe
      </div>
      <a
        href={metaMaskText === "MetaMask" ? undefined : "https://metamask.io/"}
        target="_blank"
        rel="noopener noreferrer"
      >
        <WalletOption
          connect={() => {
            metamask
              .activate()
              .then(() => {
                setConnectorType(ConnectorType.MetaMask);
                setStep();
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
              setStep();
            })
            .catch((err) => {
              console.log(err);
            });
        }}
        iconSrc={walletConnectIcon}
        walletName="WalletConnect"
      />
      <WalletOption
        connect={() => {
          coinbaseWallet
            .activate()
            .then(() => {
              setConnectorType(ConnectorType.Coinbase);
              setStep();
            })
            .catch((err) => {
              console.log(err);
            });
        }}
        iconSrc={coinbaseIcon}
        walletName="Coinbase Wallet"
      />
    </div>
  );
};

export default WalletConnect;

import coinbaseIcon from "assets/images/svgs/coinbaseIcon.svg";
import metaMaskIcon from "assets/images/svgs/metaMaskIcon.svg";
import walletConnectIcon from "assets/images/svgs/walletConnectIcon.svg";
import { ConnectorType } from "stores/connectorType";

export const getWalletSrc = (connectorType: ConnectorType): string => {
  switch (connectorType) {
    case ConnectorType.Coinbase:
      return coinbaseIcon;
    case ConnectorType.MetaMask:
      return metaMaskIcon;
    case ConnectorType.WalletConnect:
      return walletConnectIcon;
    default:
      return "";
  }
};

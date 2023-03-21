import { Connector } from "@web3-react/types";
import {
  coinbaseConnector,
  metaMaskConnector,
  walletConnectConnector,
} from "constants/connectors";
import { useEffect } from "react";

import useConnectorType, { ConnectorType } from "../stores/connectorType";

export const useWalletConnector = (
  connect: ConnectorType
): Connector | undefined => {
  const [coinbaseWallet] = coinbaseConnector;
  const [metamask] = metaMaskConnector;
  const [walletconnect] = walletConnectConnector;

  switch (connect) {
    case ConnectorType.Coinbase:
      return coinbaseWallet;
    case ConnectorType.MetaMask:
      return metamask;
    case ConnectorType.WalletConnect:
      return walletconnect;
  }
};

export const useActiveWalletConnector = (): Connector | undefined => {
  const connect = useConnectorType((state) => state.connectorType);

  const walletConnector = useWalletConnector(connect);

  return walletConnector;
};

// If a user is connected and has just refreshed the page, we will want to try and reconnect to their wallet
export default function useEagerlyConnect() {
  const connector = useActiveWalletConnector();
  const setConnectorType = useConnectorType((state) => state.setConnectorType);

  useEffect(() => {
    if (!connector) {
      setConnectorType(ConnectorType.none);
    } else {
      try {
        setTimeout(() => {
          if (connector.connectEagerly) {
            connector.connectEagerly();
          } else {
            connector.activate();
          }
        }, 10);
      } catch (error) {
        console.debug(`web3-react eager connection error: ${error}`);
        setConnectorType(ConnectorType.none);
      }
    }
  }, []);
}

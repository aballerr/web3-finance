import { CoinbaseWallet } from "@web3-react/coinbase-wallet";
import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
import { WalletConnect } from "@web3-react/walletconnect";

export enum ConnectionType {
  COINBASE,
  META_MASK,
  WALLET_CONNECT,
}

export const coinbaseConnector = initializeConnector<CoinbaseWallet>(
  (actions) => {
    return new CoinbaseWallet({
      actions,
      options: {
        url:
          "https://mainnet.infura.io/v3/57aedaef2c1143a5b89d753a362a3f07" ||
          "https://mainnet.infura.io/v3/",
        // @ts-ignore
        appName: "getbase58",
      },
    });
  }
);

export const metaMaskConnector = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
);

export const walletConnectConnector = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        rpc: {
          1:
            "https://mainnet.infura.io/v3/57aedaef2c1143a5b89d753a362a3f07" ||
            "https://mainnet.infura.io/v3/",
        },
      },
    })
);

const connectors = [
  coinbaseConnector,
  metaMaskConnector,
  walletConnectConnector,
];

export default connectors;

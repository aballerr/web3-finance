import create from "zustand";
import { persist } from "zustand/middleware";

export enum ConnectorType {
  none,
  MetaMask = "MetaMask",
  Coinbase = "Coinbase",
  WalletConnect = "WalletConnect",
}

interface State {
  connectorType: ConnectorType;
  setConnectorType: (connector: ConnectorType) => void;
}

export const getConnectorType = (walletType: string) => {
  if (walletType === "MetaMask") return ConnectorType.MetaMask;
  else if (walletType === "Coinbase") return ConnectorType.Coinbase;
  else if (walletType === "WalletConnect") return ConnectorType.WalletConnect;
  else return ConnectorType.none;
};

const useConnectorType = create<State>()(
  persist(
    (set) => ({
      connectorType: ConnectorType.none,
      setConnectorType: (connectorType) => set(() => ({ connectorType })),
    }),
    { name: "useConnectorType" }
  )
);

export default useConnectorType;

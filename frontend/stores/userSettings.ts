import { GnosisSafeInfoResponse, UserWallet } from "types";
import create from "zustand";
import { persist } from "zustand/middleware";

import { ConnectorType, getConnectorType } from "./connectorType";

interface WalletInfo {
  walletName: string;
  connectorType: ConnectorType;
}

interface WalletName {
  [key: string]: WalletInfo;
}

interface State {
  email: string;
  profilePicture: string;
  showNameWallet: boolean;
  safes: Array<GnosisSafeInfoResponse>;
  setSafes: (safes: Array<GnosisSafeInfoResponse>) => void;
  setUserInfo: (
    email: string,
    profilePicture: string,
    wallets: Array<UserWallet>
  ) => void;
  setWalletNames: (wallets: Array<UserWallet>) => void;
  setShowNameWallet: (showNameWallet: boolean) => void;
  walletNames: WalletName;
  setWalletName: (wallet: UserWallet) => void;
}

const useUserSettings = create<State>()(
  persist(
    (set) => ({
      email: "",
      profilePicture: "",
      safes: [],
      setSafes: (safes: Array<GnosisSafeInfoResponse>) =>
        set(() => ({ safes })),
      setUserInfo: (email: string, profilePicture: string, wallets) =>
        set((state) => {
          let netWalletNames = { ...state.walletNames };

          for (const wallet of wallets) {
            const { walletAddress, walletName, walletType } = wallet;
            const connectorType = getConnectorType(walletType);
            const walletInfo = {
              walletName: walletName || "",
              connectorType,
            };

            netWalletNames = {
              ...netWalletNames,
              [walletAddress]: walletInfo,
            };
          }

          return { email, profilePicture, walletNames: netWalletNames };
        }),
      showNameWallet: true,
      setShowNameWallet: (showNameWallet) => set(() => ({ showNameWallet })),
      walletNames: {},
      setWalletNames: (wallets) =>
        set((state) => {
          let netWalletNames = { ...state.walletNames };

          for (const wallet of wallets) {
            const { walletAddress, walletName, walletType } = wallet;
            const connectorType = getConnectorType(walletType);
            const walletInfo = {
              walletName: walletName || "",
              connectorType,
            };

            netWalletNames = {
              ...netWalletNames,
              [walletAddress]: walletInfo,
            };
          }

          return { walletNames: netWalletNames };
        }),
      setWalletName: (wallet: UserWallet) => {
        const { walletAddress, walletName, walletType } = wallet;
        const connectorType = getConnectorType(walletType);

        set((state) => {
          const walletInfo = {
            walletName: walletName || "",
            connectorType,
          };

          const newWalletNames = {
            ...state.walletNames,
            [walletAddress]: walletInfo,
          };

          return { walletNames: newWalletNames };
        });
      },
    }),

    { name: "useUserSettings" }
  )
);

export default useUserSettings;

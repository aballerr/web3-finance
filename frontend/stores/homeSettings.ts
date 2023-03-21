import create from "zustand";
import { devtools } from "zustand/middleware";

interface GraphSetup {
  [key: string]: string;
}

interface State {
  graphSetup: GraphSetup;
  setGraphSetup: (graphSetup: GraphSetup) => void;
}

export enum GraphTypes {
  CRYPTO_HOLDINGS = "cryptoHoldings",
  CRYPTO_BY_ASSET = "cryptoByAsset",
  CRYPTO_ACCOUNTS = "cryptoAccounts",
  EXPENSE_BY_CATEGORY = "expenseByCategory",
  GAS_FEES = "gasFees",
  NONE = "none",
}

const useHomeSettings = create<State>()(
  devtools(
    (set) => ({
      graphSetup: {
        "1": GraphTypes.NONE,
        "2": GraphTypes.NONE,
        "3": GraphTypes.NONE,
        "4": GraphTypes.NONE,
      },
      setGraphSetup: (graphSetup) => set(() => ({ graphSetup })),
    }),
    { name: "useHomeSettings" }
  )
);

export default useHomeSettings;

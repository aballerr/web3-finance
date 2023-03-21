import { GnosisSafeInfoResponse, SafeOwner } from "types";
import create from "zustand";
import { devtools } from "zustand/middleware";

interface SafeCreateParams {
  safeName: string;
  threshhold: number;
}

interface State {
  safes: Array<GnosisSafeInfoResponse>;
  setSafes: (safes: Array<GnosisSafeInfoResponse>) => void;
  step: number;
  nextStep: () => void;
  backStep: () => void;
  setStep: (step: number) => void;
  reset: () => void;
  isCreating: boolean;
  setIsCreating: (isImporting: boolean) => void;
  orginalImportComplete: boolean;
  setOriginalImportComplete: (status: boolean) => void;
  safeCreate: SafeCreateParams;
  setSafeCreate: (safeCreate: SafeCreateParams) => void;
  ownerScanningPosition: string;
  setOwnerScanningPosition: (ownerScanningPosition: string) => void;
  owners: Array<SafeOwner>;
  setOwners: (owners: Array<SafeOwner>) => void;
}

const useUserSafes = create<State>()(
  devtools(
    (set) => ({
      safes: [],
      setSafes: (safes: Array<GnosisSafeInfoResponse>) =>
        set(() => ({ safes })),
      step: 0,
      nextStep: () => set(({ step }) => ({ step: 1 + step })),
      backStep: () => set(({ step }) => ({ step: step - 1 })),
      reset: () =>
        set(() => ({
          isCreating: false,
          safes: [],
          step: 0,
          owners: [{ key: `${Math.random()}`, name: "", address: "" }],
          safeCreate: { safeName: "", threshhold: 0 },
        })),
      setStep: (step: number) => set(() => ({ step })),
      isCreating: false,
      setIsCreating: (isCreating: boolean) => set(() => ({ isCreating })),
      orginalImportComplete: false,
      setOriginalImportComplete: (orginalImportComplete: boolean) =>
        set(() => ({ orginalImportComplete })),
      safeCreate: {
        safeName: "",
        threshhold: 0,
      },
      ownerScanningPosition: "",
      setOwnerScanningPosition: (ownerScanningPosition: string) =>
        set(() => ({ ownerScanningPosition })),
      setSafeCreate: (safeCreate: SafeCreateParams) =>
        set(() => ({ safeCreate })),
      owners: [{ key: `${Math.random()}`, name: "", address: "" }],
      setOwners: (owners: Array<SafeOwner>) => set(() => ({ owners })),
    }),

    { name: "useUserSafes" }
  )
);

export default useUserSafes;

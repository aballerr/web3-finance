interface GnosisSafeOwner {
  gnosisSafeId: number;
  ownerAddress: string;
  ownerName?: string;
}

export interface GnosisSafeInfoResponse {
  address: string;
  nonce: number;
  threshold: number;
  gnosisSafeName?: string;
  owners: Array<GnosisSafeOwner>;
  masterCopy: string;
  modules: Array<string>;
  fallbackHandler: string;
  guard: string;
  version: string;
  network: string;
  companyOwner: number;
  isActive?: boolean;
}

export interface UserWallet {
  id: number;
  walletAddress: string;
  walletName: string;
  walletOwner: number;
  walletType: string;
}

export interface SafeOwner {
  key: string;
  name: string;
  address: string;
}

export interface SafeCreateRequest {
  address: string;
  gnosisSafeName?: string;
  nonce: number;
  threshold: number;
  owners: Array<SafeOwner>;
  masterCopy: string;
  modules: Array<string>;
  fallbackHandler: string;
  guard: string;
  version: string;
  chainId: number;
}

export enum Type {
  INFLOW = "inflow", // transfer of a native/erc20 token to the safe ONLY
  OUTFLOW = "outflow", // transfer of a native/erc20 token out of the safe ONLY
  OUTFLOW_TRANSACTION = "outflow_transaction", // this can represent swaps, maybe buying something, other transactions etc.  a bit more complicated
}

export interface UserFiles {
  id?: number;
  location: string;
  companyId: number;
  userId: number;
  fileName: string;
  key: string;
  bucket: string;
  transactionId: number;
  fileUse: string;
}

export interface GnosisSafeTransaction {
  id?: number;
  gnosisSafeId: number;
  companyId: number;
  txnHash: string;
  from: string;
  to: string;
  executionDate: string;
  value: string;
  valueUSD: number | null;
  txnFee: string;
  txnFeeUSD: number;
  transfers?: Array<GnosisSafeTransactionsTransfers>;
  chainId: number;
  files: Array<UserFiles>;
  isChecked?: boolean;
  type: Type;
  categoryId: number | null;
  gnosisType: string;
  memo: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GnosisSafeTransactionsTransfers {
  gnosisSafeTransaction: number;
  type: string;
  executionDate: Date;
  transactionHash: string;
  to: string;
  value: string;
  valueUSD: number;
  decimals: number;
  direction: Type;
  tokenAddress: string | null;
  from: string;
}

export interface Category {
  id?: number;
  categoryName: string;
  backgroundColor: string;
  textColor: string;
}

export interface Category {
  id?: number;
  categoryName: string;
  backgroundColor: string;
  textColor: string;
}

export interface CompanyGraphs {
  id?: number;
  companyId: number;
  userId: number;
  graphType: string;
  position: number;
}

// Drag and Drop

export const ItemTypes = {
  BOX: "box",
};

// Models for the database

export interface User {
  id: number;
  email: string;
  name?: string;
  profilePicture?: string;
  type: "manual" | "google";
}

export interface UserWallet {
  id: number;
  walletAddress: string;
  walletName: string;
  walletOwner: number;
  walletType: string;
}

export interface Company {
  id: number;
  companyName: string;
  owner: number;
  setupComplete: boolean;
}

export enum Type {
  INFLOW = "inflow", // transfer of a native/erc20 token to the safe ONLY
  OUTFLOW = "outflow", // transfer of a native/erc20 token out of the safe ONLY
  OUTFLOW_TRANSACTION = "outflow_transaction", // this can represent swaps, maybe buying something, other transactions etc.  a bit more complicated
}

export interface GnosisSafeTransaction {
  id?: number;
  gnosisSafeId: number;
  companyId: number;
  txnHash: string;
  from: string;
  to: string;
  executionDate: Date;
  value: string;
  valueUSD: number | null;
  txnFee: string;
  txnFeeUSD: number;
  transfers?: Array<GnosisSafeTransactionsTransfers>;
  chainId: number;
  type: Type;
  files?: Array<UserFiles>;
  categoryId: number | undefined | null;
  gnosisType: string;
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

export interface GnosisSafeOwner {
  gnosisSafeId: number;
  ownerAddress: string;
  ownerName?: string;
}

export interface GnosisSafeInfo {
  id: number;
  address: string;
  gnosisSafeName?: string;
  nonce: number;
  threshold: number;
  owners: Array<GnosisSafeOwner>;
  masterCopy: string;
  modules: Array<string>;
  fallbackHandler: string;
  guard: string;
  version: string;
  network: string;
  chainId: number;
  createdInBase58: boolean;
  companyOwner: number;
  isActive: boolean;
  importedBy: number;
}

export interface Erc20TokenInfo {
  id: string;
  tokenId: string;
  symbol: string;
  name: string;
  assetPlatformId: string;
  ethereumAddress: string;
  polygonAddress: string;
  arbitrumAddress: string;
  optimimismAddress: string;
  assetSrcImage: string;
  chainId: number;
}

export interface ERC20HistoricalPrice {
  id: number;
  tokenId: string;
  symbol: string;
  price: number;
  date: string; // why is this a string? it's a string on coin gecko
}

export interface AuthCode {
  email: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionCategory {
  id?: number;
  companyId: number;
  categoryName: string;
  backgroundColor: string;
  textColor: string;
}

export interface TransactionFilter {
  id?: number;
  companyId: number;
  filterName: string;
  userId: number;
  filter: string;
  shared: boolean;
}

export interface UserFiles {
  id?: number;
  location: string;
  companyId: number;
  fileName: string;
  userId: number;
  key: string;
  bucket: string;
  transactionId: number;
  fileUse: string;
}

export interface CompanyGraphs {
  id?: number;
  companyId: number;
  userId: number;
  graphType: string;
  position: number;
}

export interface GnosisSafeBalanceHistory {
  id?: number;
  tokenId: string;
  gnosisSafeId: number;
  companyId: number;
  balance: string;
  ethValue: string;
  fiatBalance: number;
  fiatConversion: string;
  fiatCode: string;
  network: string;
  chainId: number;
  decimals: number;
  isTotalBalance: boolean;
  isMostRecent: boolean;
}

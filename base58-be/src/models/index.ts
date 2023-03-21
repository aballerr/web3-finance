export interface GnosisSafeInfoResponse {
  address: string;
  nonce: number;
  threshold: number;
  owners: Array<string>;
  masterCopy: string;
  modules: Array<string>;
  fallbackHandler: string;
  guard: string;
  version: string;
  network: string;
  companyOwner: number;
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

interface Confirmation {
  owner: string;
  submissionDate: string;
  transactionHash: null;
  signature: string;
  signatureType: "EOA" | "APPROVED_HASH";
}

interface TokenInfo {
  type: "ERC20";
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUri: string;
}

export interface Transfer {
  type: "ERC20_TRANSFER" | "ETHER_TRANSFER";
  executionDate: string;
  blockNumber: number;
  transactionHash: string;
  to: string;
  value: string;
  tokenId: null | string;
  tokenAddress: null | string;
  tokenInfo: TokenInfo;
  from: string;
}

interface DataDecoded {
  method: "transfer" | "multicall";
}

export interface GnosisSafeTransactionResponseData {
  safe: string;
  from: string;
  to: string;
  value: string;
  data: null;
  operation: number;
  gasToken: string;
  safeTxGas: number;
  baseGas: number;
  gasPrice: string;
  refundReceiver: string;
  nonce: number;
  executionDate: string;
  submissionDate: string;
  modified: string;
  blockNumber: number;
  transactionHash: string;
  txHash: string;
  safeTxHash: string;
  executor: string;
  isExecuted: true;
  isSuccessful: true;
  ethGasPrice: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  gasUsed: number;
  fee: string;
  origin: null;
  dataDecoded: null | DataDecoded;
  confirmationsRequired: number;
  confirmations: Array<Confirmation>;
  trusted: true;
  signatures: string;
  transfers: Array<Transfer>;
  txType: "MULTISIG_TRANSACTION" | "ETHEREUM_TRANSACTION";
}

export interface GnosisSafeTransactionResponse {
  results: Array<GnosisSafeTransactionResponseData>;
}

export interface CoinHistoryResponse {
  id: string;
  symbol: string;
  name: string;
  image: {
    thumb: string;
    small: string;
  };
  market_data: {
    current_price: {
      usd: number;
    };
  };
  status?: {
    error_code: number;
  };
}

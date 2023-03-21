import {
  ChainInfo,
  getChainsConfig,
  RPC_AUTHENTICATION,
} from "@gnosis.pm/safe-react-gateway-sdk";

type ChainName = ChainInfo["chainName"];
export type ShortName = ChainInfo["shortName"];

// Remain agnostic and follow CGW by using the following
export type ChainId = ChainInfo["chainId"];

export const getChains = (): ChainInfo[] => chains;

export const emptyChainInfo: ChainInfo = {
  transactionService: "",
  chainId: "",
  chainName: "",
  shortName: "",
  l2: false,
  description: "",
  rpcUri: { authentication: "" as RPC_AUTHENTICATION, value: "" },
  publicRpcUri: { authentication: "" as RPC_AUTHENTICATION, value: "" },
  safeAppsRpcUri: { authentication: "" as RPC_AUTHENTICATION, value: "" },
  blockExplorerUriTemplate: {
    address: "",
    txHash: "",
    api: "",
  },
  nativeCurrency: {
    name: "",
    symbol: "",
    decimals: 0,
    logoUri: "",
  },
  theme: { textColor: "", backgroundColor: "" },
  ensRegistryAddress: "",
  gasPrice: [],
  disabledWallets: [],
  features: [],
};

let chains: ChainInfo[] = [];

export const loadChains = async () => {
  const { results = [] } = await getChainsConfig();
  chains = results;
  // Set the initail web3 provider after loading chains
};

export const getChainById = (chainId: ChainId): ChainInfo => {
  return (
    getChains().find((chain) => chain.chainId === chainId) || emptyChainInfo
  );
};

interface CHAIN_URLS {
  1: string;
  137: string;
  10: string;
  42161: string;
}

const CHAIN_URLS: CHAIN_URLS = {
  1: "https://etherscan.io",
  137: "https://polygonscan.com",
  10: "https://optimistic.etherscan.io",
  42161: "https://arbiscan.io",
};

export const getChainExplorer = (chainId: number) => {
  // @ts-ignore
  return CHAIN_URLS[chainId] ?? "";
};

export const getNativeToken = (chainId: number) => {
  return chainId === 137 ? "MATIC" : "ETH";
};

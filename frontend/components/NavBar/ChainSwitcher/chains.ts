import arbitrumIcon from "../../../assets/images/svgs/arbitrumIcon.svg";
import ethereumIcon from "../../../assets/images/svgs/ethereumIcon.svg";
import optimismIcon from "../../../assets/images/svgs/optimismIcon.svg";
import polygonIcon from "../../../assets/images/svgs/polygonIcon.svg";

interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

export interface ChainOptionType {
  chainId: number;
  chainName: string;
  rpcUrls: Array<string>;
  nativeCurrency: NativeCurrency;
  blockExplorerUrls: Array<string>;
  iconSrc: string;
}

const optimism: ChainOptionType = {
  chainId: 10,
  chainName: "Optimism",
  rpcUrls: ["https://mainnet.optimism.io"],
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorerUrls: ["https://optimistic.etherscan.io/"],
  iconSrc: optimismIcon,
};

const polygon: ChainOptionType = {
  chainId: 137,
  chainName: "Polygon",
  rpcUrls: ["https://polygon-rpc.com/"],
  nativeCurrency: {
    name: "Polygon Matic",
    symbol: "MATIC",
    decimals: 18,
  },
  blockExplorerUrls: ["https://polygonscan.com/"],
  iconSrc: polygonIcon,
};

const arbitrum: ChainOptionType = {
  chainId: 42161,
  chainName: "Arbitrum",
  rpcUrls: ["https://arb1.arbitrum.io/rpc"],
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorerUrls: ["https://arbiscan.io/"],
  iconSrc: arbitrumIcon,
};

const ethereum: ChainOptionType = {
  chainId: 1,
  chainName: "Ethereum",
  rpcUrls: ["https://mainnet.infura.io/v3/4bf032f2d38a4ed6bb975b80d6340847"],
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorerUrls: ["https://etherscan.io/"],
  iconSrc: ethereumIcon,
};

const chainOptions = [ethereum, polygon, arbitrum, optimism];

export default chainOptions;

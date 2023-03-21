import chainOptions from "components/NavBar/ChainSwitcher/chains";

enum SupportedChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5,
  KOVAN = 42,

  ARBITRUM_ONE = 42161,
  ARBITRUM_RINKEBY = 421611,

  OPTIMISM = 10,
  OPTIMISTIC_KOVAN = 69,

  POLYGON = 137,
  POLYGON_MUMBAI = 80001,

  CELO = 42220,
  CELO_ALFAJORES = 44787,
}

type Network = "ethereum" | "arbitrum" | "optimism" | "polygon";

function chainIdToNetworkName(networkId: SupportedChainId): Network {
  switch (networkId) {
    case SupportedChainId.MAINNET:
      return "ethereum";
    case SupportedChainId.ARBITRUM_ONE:
      return "arbitrum";
    case SupportedChainId.OPTIMISM:
      return "optimism";
    case SupportedChainId.POLYGON:
      return "polygon";
    default:
      return "ethereum";
  }
}

export function getTokenLogoURI(
  address: string | null,
  chainId: SupportedChainId = SupportedChainId.MAINNET
): string {
  const networkName = chainIdToNetworkName(chainId);

  if (address === null) {
    const imageIconSrc =
      chainId === 137 ? chainOptions[1].iconSrc : chainOptions[0].iconSrc;
    return imageIconSrc;
  }

  return `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/${networkName}/assets/${address}/logo.png`;
}

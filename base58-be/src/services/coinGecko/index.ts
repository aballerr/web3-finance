import fetch from "node-fetch";
import { CoinHistoryResponse } from "../../models";
import { Erc20TokenInfo, ERC20HistoricalPrice } from "../../models/db";
import getKnexClient, { DBModels } from "../db/knex";
import { ChainId } from "../../constants";
import { updateAllUserSafes } from "../gnosis";
import getSecret, { SecretValues, StoreSecrets } from "../secrets";

const BASE_URL = "https://pro-api.coingecko.com/api/v3";

const { devmode } = process.env;

//   /coins/matic/history?date=30-12-2020
interface CoinGeckAssetPlatform {
  id: string;
  chain_identifier: number;
  name: string;
  shortname: string;
}

interface CoinGeckAssetPlatforms {
  polygon: CoinGeckAssetPlatform;
  ethereum: CoinGeckAssetPlatform;
  optimism: CoinGeckAssetPlatform;
  arbitrum: CoinGeckAssetPlatform;
}

enum CoinId {
  ETHEREUM = "ethereum",
  POLYGON = "matic-network",
}

const coinGeckAssetPlatroms: CoinGeckAssetPlatforms = {
  polygon: {
    id: "polygon-pos",
    chain_identifier: 137,
    name: "Polygon POS",
    shortname: "MATIC",
  },
  ethereum: {
    id: "ethereum",
    chain_identifier: 1,
    name: "Ethereum",
    shortname: "",
  },
  optimism: {
    id: "optimistic-ethereum",
    chain_identifier: 10,
    name: "Optimism",
    shortname: "Optimism",
  },
  arbitrum: {
    id: "arbitrum-one",
    chain_identifier: 42161,
    name: "Arbitrum One",
    shortname: "Arbitrum",
  },
};

const getCoinGeckAssetPlatform = (chainId: number): CoinGeckAssetPlatform => {
  switch (chainId) {
    case 137:
      return coinGeckAssetPlatroms.polygon;
    case 10:
      return coinGeckAssetPlatroms.optimism;
    case 41261:
      return coinGeckAssetPlatroms.arbitrum;
    default:
      return coinGeckAssetPlatroms.ethereum;
  }
};

interface ERC20PriceHistory {
  symbol: string;
  address: string;
  chainId: number;
  date: string;
}

interface CoinGeckResponse {
  id: string;
  symbol: string;
  name: string;
  asset_platform_id: string;
  error?: string;
  platforms: {
    ethereum: string;
    "polygon-pos": string;
    "arbitrum-one": string;
    "optimistic-ethereum": string;
  };
  status?: {
    error_code: number;
  };
  image: {
    thumb: string;
    small: string;
    large: string;
  };
}

// ethereumAddress: string;
// polygonAddress: string;
// arbitrumAddress: string;
// optimimismAddress: string;

const getAddressKey = (chainId: number): string => {
  switch (chainId) {
    case 137:
      return "polygonAddress";
    case 10:
      return "arbitrumAddress";
    case 41261:
      return "optimimismAddress";
    default:
      return "ethereumAddress";
  }
};

export const getTokenInformation = async ({
  symbol,
  address,
  chainId,
}: ERC20PriceHistory): Promise<Erc20TokenInfo | null> => {
  const knex = await getKnexClient();
  const addressKey = getAddressKey(chainId);
  const { coingecko } = (await getSecret(
    StoreSecrets.COINGECKO
  )) as SecretValues;
  const WITH_KEY = `x_cg_pro_api_key=${coingecko}`;

  const dataExists = await knex<Erc20TokenInfo>(DBModels.ERC20_TOKEN_INFO)
    .where({ symbol: symbol.toLowerCase() })
    .orWhere({ [addressKey]: address.toLowerCase() })
    .first();

  if (dataExists) {
    return dataExists;
  } else {
    // https://api.coingecko.com/api/v3/coins/polygon-pos/contract/0xc2132d05d31c914a87c6611c10748aeb04b58e8f
    // https://api.coingecko.com/api/v3/coins/polygon-pos/contract/0xc2132d05d31c914a87c6611c10748aeb04b58e8f
    const assetPlateform = getCoinGeckAssetPlatform(chainId);
    const URL = `${BASE_URL}/coins/${
      assetPlateform.id
    }/contract/${address.toLowerCase()}?${WITH_KEY}`;
    const response: CoinGeckResponse = await fetch(URL)
      .then((res) => res.json())
      .catch((err) => {
        console.log("oh no, error");
        console.log(err);
      });

    if (response?.status?.error_code === 429) {
      console.log(response);
      return null;
    } else if (response.error) {
      return null;
    }

    const insertedData = await knex<Erc20TokenInfo>(DBModels.ERC20_TOKEN_INFO)
      .insert({
        tokenId: response.id,
        symbol: response.symbol,
        name: response.name,
        assetPlatformId: response.asset_platform_id,
        ethereumAddress: response.platforms.ethereum,
        polygonAddress: response.platforms["polygon-pos"],
        arbitrumAddress: response.platforms["arbitrum-one"],
        optimimismAddress: response.platforms["optimistic-ethereum"],
        assetSrcImage: response.image.small,
      })
      .returning("*");

    return insertedData[0];
  }
};

interface CoinPriceHistory {
  id: string;
  date: string;
}

const getCoinPriceAtDate = async ({
  id,
  date,
}: CoinPriceHistory): Promise<ERC20HistoricalPrice> => {
  const knex = await getKnexClient();
  const { coingecko } = (await getSecret(
    StoreSecrets.COINGECKO
  )) as SecretValues;
  const WITH_KEY = `x_cg_pro_api_key=${coingecko}`;
  const URL = `${BASE_URL}/coins/${id}/history?date=${date}&localization=false&${WITH_KEY}`;

  const coinInfo = await knex<ERC20HistoricalPrice>(
    DBModels.ERC20_HISTORICAL_PRICE
  )
    .where({ tokenId: id, date })
    .first();

  if (coinInfo === undefined) {
    try {
      const response: CoinHistoryResponse = await fetch(URL).then((res) =>
        res.json()
      );

      if (response.status?.error_code === 429) {
        console.log(response);
      }

      const coinInfo = await knex<ERC20HistoricalPrice>(
        DBModels.ERC20_HISTORICAL_PRICE
      )
        .insert({
          tokenId: id,
          symbol: response.symbol,
          date,
          price: response.market_data.current_price.usd,
        })
        .returning("*");

      return coinInfo[0];
    } catch (err) {
      console.log(err);
      // it's possible that the response failed, it doesn't always throw an error. So we need to log the response
      console.log("coingeck failed: linkely timeout");

      if (devmode) {
        setTimeout(() => {
          updateAllUserSafes();
        }, 90000);
      }

      const response: CoinHistoryResponse = await fetch(URL).then((res) =>
        res.json()
      );

      const coinInfo = await knex<ERC20HistoricalPrice>(
        DBModels.ERC20_HISTORICAL_PRICE
      )
        .insert({
          tokenId: id,
          symbol: response.symbol,
          date,
          price: response.market_data.current_price.usd,
        })
        .returning("*");

      return coinInfo[0];
    }
  }

  return coinInfo;
};

export const getErc20TokenPriceAtDate = async (
  erc20PriceHistory: ERC20PriceHistory
) => {
  const tokenInformation = await getTokenInformation(erc20PriceHistory);
  if (tokenInformation === null) return null;

  return getCoinPriceAtDate({
    id: tokenInformation.tokenId,
    date: erc20PriceHistory.date,
  });
};

interface NativeCoinPriceHistory {
  chainId: number;
  date: string;
}

// https://api.coingecko.com/api/v3/coins/matic-network/history?date=10-12-2021&localization=false
export const getNativeCoinPriceAtDate = async ({
  chainId,
  date,
}: NativeCoinPriceHistory): Promise<ERC20HistoricalPrice> => {
  const id = chainId === ChainId.POLYGON ? CoinId.POLYGON : CoinId.ETHEREUM;

  return getCoinPriceAtDate({ id, date });
};

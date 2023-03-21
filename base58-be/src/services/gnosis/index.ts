import Bn from "bn.js";
import fetch from "node-fetch";
import web3 from "web3";
import { ethers } from "ethers";
import { addDays } from "date-fns";

import getKnexClient, { DBModels, getPreloadedClient } from "../db/knex";
import { networkNameMap } from "../../services/db/gnosis-safe";

require("dotenv").config();

import {
  GnosisSafeTransactionResponseData,
  GnosisSafeTransactionResponse,
  Transfer,
} from "../../models";

import {
  Company,
  GnosisSafeBalanceHistory,
  GnosisSafeInfo,
  GnosisSafeTransaction,
  GnosisSafeTransactionsTransfers,
  Type,
} from "../../models/db";
import {
  getNativeCoinPriceAtDate,
  getErc20TokenPriceAtDate,
  getTokenInformation,
} from "../../services/coinGecko";
import { ChainId } from "../../constants";
import {
  createOrFindTransaction,
  createOrFindTransactions,
  createOrFindTransfer,
} from "../db/gnosis-safe";
import { Token } from "aws-sdk/lib/token";

export enum Network {
  MAINNET = "mainnet",
  POLYGON = "polygon",
  ARBITRUM = "arbitrum",
  OPTIMIST = "optimism",
}

export const ALL_NETWORKS = [
  "https://safe-transaction-mainnet.safe.global",
  "https://safe-transaction-polygon.safe.global",
  "https://safe-transaction-arbitrum.safe.global",
  "https://safe-transaction-optimism.safe.global",
];

const getNetwork = (chainId: number): Network => {
  switch (chainId) {
    case 1:
      return Network.MAINNET;
    case 137:
      return Network.POLYGON;
    case 10:
      return Network.OPTIMIST;
    case 42161:
      return Network.ARBITRUM;
    default:
      return Network.MAINNET;
  }
};

const account = "0x873e29B6631E2955aCa5f5585489E13E1999c752";

const formatDate = (date: string) => {
  const executionDate = new Date(date);

  return `${executionDate.getDate()}-${
    executionDate.getMonth() + 1
  }-${executionDate.getFullYear()}`;
};

const processTransfer = async (
  transfer: Transfer,
  chainId: number,
  isOutflow?: boolean
) => {
  const date = formatDate(transfer.executionDate);

  const ethValue =
    transfer.type === "ETHER_TRANSFER"
      ? web3.utils.fromWei(transfer.value)
      : ethers.utils.formatUnits(transfer.value, transfer.tokenInfo.decimals);

  const coinPriceData =
    transfer.type === "ETHER_TRANSFER"
      ? await getNativeCoinPriceAtDate({ chainId, date })
      : await getErc20TokenPriceAtDate({
          symbol: transfer?.tokenInfo?.symbol,
          address: transfer?.tokenInfo?.address,
          chainId: chainId,
          date,
        });

  const nativePrice =
    isOutflow && transfer.type === "ETHER_TRANSFER"
      ? coinPriceData
      : await getNativeCoinPriceAtDate({ chainId, date });

  return coinPriceData === null
    ? null
    : {
        ethValue: ethValue,
        valueUSD: parseFloat(ethValue) * coinPriceData.price,
        coinPriceData,
        nativePrice,
      };
};

export const getGnosisBaseUrl = (safe: GnosisSafeInfo): string => {
  const network = getNetwork(safe.chainId);

  return `https://safe-transaction-${network}.safe.global/api/v1/safes`;
};

const processInflows = async (
  inflowTransactions: Array<GnosisSafeTransactionResponseData>,
  chainId: ChainId,
  companyId: number,
  gnosisSafeId: number
) => {
  for (const inflowTransaction of inflowTransactions) {
    const transaction: GnosisSafeTransaction = {
      gnosisSafeId: gnosisSafeId,
      companyId,
      txnHash: inflowTransaction.txHash,
      from: inflowTransaction.from,
      to: inflowTransaction.to,
      executionDate: new Date(inflowTransaction.executionDate),
      value: inflowTransaction.value,
      valueUSD: 0,
      txnFee: "",
      txnFeeUSD: 0,
      chainId: chainId,
      type: Type.INFLOW,
      categoryId: undefined,
      gnosisType: inflowTransaction.txType,
    };

    const insertedTransaction = await createOrFindTransaction(transaction);

    for (const transfer of inflowTransaction.transfers) {
      if (insertedTransaction.id !== undefined) {
        const processedTransfer = await processTransfer(transfer, chainId);
        if (processedTransfer === null) continue;
        const { valueUSD } = processedTransfer;

        const gnosisSafeTransactionTransfer: GnosisSafeTransactionsTransfers = {
          gnosisSafeTransaction: insertedTransaction.id,
          type: transfer.type,
          executionDate: new Date(transfer.executionDate),
          transactionHash: transfer.transactionHash,
          to: transfer.to,
          value: transfer.value,
          direction: Type.INFLOW,
          valueUSD,
          decimals: transfer?.tokenInfo?.decimals ?? 18,
          tokenAddress: transfer.tokenAddress || null,
          from: transfer.from,
        };

        const newTransfer = await createOrFindTransfer(
          gnosisSafeTransactionTransfer
        );
      }
    }
  }
};

const processOutflows = async (
  outflowTransactions: Array<GnosisSafeTransactionResponseData>,
  chainId: ChainId,
  companyId: number,
  gnosisSafeId: number
) => {
  for (const outflowTransaction of outflowTransactions) {
    const gasFee = web3.utils.fromWei(outflowTransaction.fee);
    const ethValue = web3.utils.fromWei(outflowTransaction.value);
    const date = formatDate(outflowTransaction.executionDate);
    const nativeTokenPrice = await getNativeCoinPriceAtDate({ chainId, date });

    if (
      outflowTransaction.dataDecoded === null ||
      outflowTransaction.dataDecoded.method === "transfer"
    ) {
      const transaction: GnosisSafeTransaction = {
        gnosisSafeId: gnosisSafeId,
        companyId,
        txnHash: outflowTransaction.transactionHash,
        from: outflowTransaction.safe,
        to: outflowTransaction.to,
        executionDate: new Date(outflowTransaction.executionDate),
        value: outflowTransaction.value,
        valueUSD: parseFloat(ethValue) * nativeTokenPrice.price,
        txnFee: outflowTransaction.fee,
        txnFeeUSD: parseFloat(gasFee) * nativeTokenPrice.price,
        chainId: chainId,
        type: Type.OUTFLOW,
        categoryId: undefined,
        gnosisType: outflowTransaction.txType,
      };

      const newTransaction = await createOrFindTransaction(transaction);

      for (const transfer of outflowTransaction.transfers) {
        if (newTransaction.id !== undefined) {
          const processedTransfer = await processTransfer(transfer, chainId);
          if (processedTransfer === null) continue;
          const { valueUSD } = processedTransfer;

          const gnosisSafeTransactionTransfer: GnosisSafeTransactionsTransfers =
            {
              gnosisSafeTransaction: newTransaction.id,
              type: transfer.type,
              executionDate: new Date(transfer.executionDate),
              transactionHash: transfer.transactionHash,
              to: transfer.to,
              value: transfer.value,
              direction: Type.OUTFLOW,
              valueUSD,
              decimals: transfer?.tokenInfo?.decimals ?? 18,
              tokenAddress: transfer.tokenAddress || null,
              from: transfer.from,
            };

          const newTransfer = await createOrFindTransfer(
            gnosisSafeTransactionTransfer
          );
        }
      }
    } else {
      const transaction: GnosisSafeTransaction = {
        gnosisSafeId: gnosisSafeId,
        companyId,
        txnHash: outflowTransaction.transactionHash,
        from: outflowTransaction.safe,
        to: outflowTransaction.to,
        executionDate: new Date(outflowTransaction.executionDate),
        value: outflowTransaction.value,
        valueUSD: parseFloat(ethValue) * nativeTokenPrice.price,
        txnFee: outflowTransaction.fee,
        txnFeeUSD: parseFloat(gasFee) * nativeTokenPrice.price,
        chainId: chainId,
        type: Type.OUTFLOW_TRANSACTION,
        categoryId: undefined,
        gnosisType: outflowTransaction.txType,
      };

      const newTransaction = await createOrFindTransaction(transaction);

      for (const transfer of outflowTransaction.transfers) {
        const processedTransfer = await processTransfer(transfer, chainId);
        if (processedTransfer === null) continue;
        const { valueUSD } = processedTransfer;

        if (newTransaction.id !== undefined) {
          const direction =
            transfer.to === outflowTransaction.safe
              ? Type.INFLOW
              : Type.OUTFLOW;

          const gnosisSafeTransactionTransfer: GnosisSafeTransactionsTransfers =
            {
              gnosisSafeTransaction: newTransaction.id,
              type: transfer.type,
              executionDate: new Date(transfer.executionDate),
              transactionHash: transfer.transactionHash,
              to: transfer.to,
              value: transfer.value,
              direction,
              valueUSD,
              decimals: transfer?.tokenInfo?.decimals ?? 18,
              tokenAddress: transfer.tokenAddress || null,
              from: transfer.from,
            };

          const newTransfer = await createOrFindTransfer(
            gnosisSafeTransactionTransfer
          );
        }
      }
    }
  }
};

export const updateAllUserSafes = async () => {
  const knex = await getPreloadedClient();
  const companies = await knex.COMPANY().where({});

  const allUpdates = [];
  for (const company of companies) {
    allUpdates.push(importAllSafeTransactions(company.id));
  }

  return Promise.all(allUpdates);
};

export const importAllSafeTransactions = async (companyOwner: number) => {
  const knex = await getKnexClient();
  const safes = await knex<GnosisSafeInfo>(DBModels.GNOSIS_SAFES).where({
    companyOwner,
    isActive: true,
  });

  console.log(`Updating safes for ${companyOwner}}`);
  console.log(safes);

  for (const safe of safes) {
    const baseURL = getGnosisBaseUrl(safe);
    const url = `${baseURL}/${safe.address}/all-transactions/?executed=true&queued=false&trusted=true`;

    const response: GnosisSafeTransactionResponse = await fetch(url).then(
      (res) => res.json()
    );
    const { results } = response;

    const inflows = results.filter((result) => !result?.confirmations);
    const outFlows = results.filter((result) => result?.confirmations);

    await processInflows(inflows, safe.chainId, companyOwner, safe.id);
    await processOutflows(outFlows, safe.chainId, companyOwner, safe.id);
  }

  console.log(`Done updating safes for ${companyOwner}}`);
};

const buildInQuery = (key: string, values: Array<string | number>) =>
  values.length
    ? `and "${key}" in ( ${values.map((value) => `'${value}'`).join(",")} )`
    : "";

const buildQuery = (filterKey: string, filter: any): string => {
  if (filter[filterKey] && Object.entries(filter[filterKey]).length > 0) {
    const filterValues = [];

    for (const [key, value] of Object.entries(filter[filterKey])) {
      if (value === true) {
        filterValues.push(key);
      }
    }
    if (filterValues.length) {
      return buildInQuery(filterKey, filterValues);
    }
  }

  return "";
};

const buildSafesQuery = async (body: any): Promise<string> => {
  const knex = await getPreloadedClient();
  const safeEntries = body.safes ? Object.entries(body.safes) : [];

  if (safeEntries.length > 0) {
    const safes = [];

    for (const [key, value] of safeEntries) {
      if (value === true) {
        safes.push(key);
      }
    }

    const queriedSafes = (
      await knex.GNOSIS_SAFES().whereIn("address", safes).select("id")
    ).map(({ id }) => id);

    if (queriedSafes.length) {
      return buildInQuery("gnosisSafeId", queriedSafes);
    }
  }

  return "";
};

const buildAssetQuery = async (
  body: any,
  company: Company
): Promise<string> => {
  const knex = await getKnexClient();
  const assetEntries = body.assets ? Object.entries(body.assets) : [];
  let hasNull = false;

  if (assetEntries.length > 0) {
    const assets = [];

    for (const [key, value] of assetEntries) {
      if (value === true) {
        assets.push(key);
      }

      if (key === "null" && value === true) {
        hasNull = true;
      }
    }

    const nullQuery = hasNull ? `or "tokenAddress" is null` : "";

    const query = `select DISTINCT "gnosisSafeTransactions".id  from "gnosisSafeTransactions" 
    inner join "gnosisSafeTransactionsTransfers" on "gnosisSafeTransactionsTransfers"."gnosisSafeTransaction" = "gnosisSafeTransactions".id
    where "companyId" = ${company.id} 
    ${buildInQuery("tokenAddress", assets)} 
    ${nullQuery};
    `;

    const { rows } = await knex.raw(query);

    const finalRows = rows.map(({ id }: { id: number }) => id);
    const finalQuery = buildInQuery("id", finalRows);

    return finalQuery;
  }

  return "";
};

const buildDateQuery = (body: any): string => {
  let finalStr = "";
  // and Date between '2011/02/25' and '2011/02/27 23:59:59.999'
  // and Date >= '2011/02/25' and Date <= '2011/02/27 23:59:59.999'
  if (body?.dateRange?.from) {
    finalStr += `and "executionDate" >= '${body.dateRange.from}'`;
  }
  if (body?.dateRange?.to) {
    const finalDate = addDays(new Date(body.dateRange.to), 1);
    finalStr += `and "executionDate" <= '${finalDate.toUTCString()}'`;
  }

  return finalStr;
};

export const processFilters = async (body: any, company: Company) => {
  let finalQuery = "";

  finalQuery += buildQuery("categoryId", body);
  finalQuery += buildQuery("type", body);
  finalQuery += await buildSafesQuery(body);
  finalQuery += await buildAssetQuery(body, company);
  finalQuery += buildDateQuery(body);

  if (body?.from?.trim()?.length > 0) {
    const newQ = `and "from" = '${body?.from?.trim()}'`;
    finalQuery += newQ;
  }

  if (body?.to?.trim()?.length > 0) {
    const newQ = `and "to" = '${body?.to?.trim()}'`;
    finalQuery += newQ;
  }

  if (body?.fromDate?.trim()?.length > 0) {
    const newQ = `and "executionDate" > now() - interval '${body?.fromDate?.trim()}'`;
    finalQuery += newQ;
  }

  return finalQuery;
};

interface AssetMap {
  [key: number]: GnosisSafeBalanceHistory;
}

export const updateSafeBalances = async (companyOwner: number) => {
  const knex = await getPreloadedClient();
  const defaultClient = await getKnexClient();
  const safes = await knex
    .GNOSIS_SAFES()
    .where({ companyOwner: companyOwner, isActive: true });

  const updateAll = await knex
    .GNOSIS_SAFE_BALANCE_HISTORY()
    .where({ companyId: companyOwner, isMostRecent: true })
    .update({ isMostRecent: false });

  for (const safe of safes) {
    const url = `${safe.network}/api/v1/safes/${safe.address}/balances/usd/?trusted=false&exclude_spam=false`;

    // @ts-ignore
    const network = networkNameMap[safe.network];
    const assets = await fetch(url).then((res) => res.json());

    for (const asset of assets) {
      const symbol = asset.token
        ? asset.token.symbol
        : safe.chainId === 137
        ? "matic"
        : "eth";

      const tokenInfo = await getTokenInformation({
        symbol,
        address: asset?.tokenAddress ?? "",
        chainId: safe.chainId,
        date: asset.timestamp,
      });

      if (tokenInfo === null) continue;

      const gnosisSafeBalanceHistory: GnosisSafeBalanceHistory = {
        tokenId: tokenInfo.id,
        gnosisSafeId: safe.id,
        companyId: safe.companyOwner,
        balance: asset.balance,
        ethValue: asset.ethBalance,
        fiatBalance: parseFloat(asset.fiatBalance),
        fiatConversion: asset.fiatConversion,
        fiatCode: asset.fiatCode,
        network,
        chainId: safe.chainId,
        decimals: asset.token ? asset.token.decimals : 18,
        isTotalBalance: false,
        isMostRecent: true,
      };

      const exists = await knex
        .GNOSIS_SAFE_BALANCE_HISTORY()
        .where({
          tokenId: tokenInfo.id,
          gnosisSafeId: safe.id,
          companyId: safe.companyOwner,
        })

        .whereRaw(`"createdAt" > now() - interval '1 day'`)
        .first();

      if (!exists) {
        await knex
          .GNOSIS_SAFE_BALANCE_HISTORY()
          .insert(gnosisSafeBalanceHistory);
      } else {
        await knex
          .GNOSIS_SAFE_BALANCE_HISTORY()
          .where({
            tokenId: tokenInfo.id,
            gnosisSafeId: safe.id,
            companyId: safe.companyOwner,
          })
          .update(gnosisSafeBalanceHistory);
      }
    }
  }

  const allAssets = await defaultClient.raw(
    `select *, "gnosisSafeBalanceHistory"."chainId"  from "gnosisSafeBalanceHistory" 
    inner join "erc20TokenInfo" on "erc20TokenInfo"."id" = "gnosisSafeBalanceHistory"."tokenId" where "companyId" = ?
    and "gnosisSafeBalanceHistory"."createdAt" > now() - interval '1 day'`,
    [companyOwner]
  );

  const allAssetsMap: AssetMap = {};

  for (const asset of allAssets.rows) {
    if (!allAssetsMap[asset.tokenId]) {
      allAssetsMap[asset.tokenId] = {
        tokenId: asset.id,
        gnosisSafeId: asset.gnosisSafeId,
        companyId: asset.companyId,
        balance: asset.balance,
        ethValue: asset.ethValue,
        fiatBalance: asset.fiatBalance,
        fiatConversion: asset.fiatConversion,
        fiatCode: asset.fiatCode,
        network: asset.network,
        chainId: asset.chainId,
        decimals: asset.decimals,
        isTotalBalance: true,
        isMostRecent: true,
      };
    } else {
      allAssetsMap[asset.tokenId].fiatBalance += asset.fiatBalance;
      allAssetsMap[asset.tokenId].balance = new Bn(
        allAssetsMap[asset.tokenId].balance
      )
        .add(new Bn(asset.balance))
        .toString();
    }
  }

  const allValues = Object.values(allAssetsMap);

  for (const asset of allValues) {
    const exists = await knex
      .GNOSIS_SAFE_BALANCE_HISTORY()
      .where({
        tokenId: asset.tokenId,
        companyId: companyOwner,
        isTotalBalance: true,
      })
      .whereRaw(`"createdAt" > now() - interval '1 day'`)
      .first();

    if (!exists) {
      await knex.GNOSIS_SAFE_BALANCE_HISTORY().insert(asset);
    } else {
      await knex
        .GNOSIS_SAFE_BALANCE_HISTORY()
        .where({ id: exists.id })
        .update(asset);
    }
  }
};

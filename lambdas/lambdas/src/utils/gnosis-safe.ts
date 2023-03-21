import getKnexClient, { DBModels } from "./knex";
import { GnosisSafeInfoResponse } from "../models";
import { Company, UserWallet } from "../models/db";

import {
  GnosisSafeInfo,
  GnosisSafeOwner,
  GnosisSafeTransaction,
  GnosisSafeTransactionsTransfers,
} from "../models/db";

export const chainIdMap = {
  "https://safe-transaction-mainnet.safe.global": 1,
  "https://safe-transaction-goerli.safe.global/": 5,
  "https://safe-transaction-polygon.safe.global": 137,
  "https://safe-transaction-arbitrum.safe.global": 42161,
  "https://safe-transaction-optimism.safe.global": 10,
};

export const networkNameMap = {
  "https://safe-transaction-mainnet.safe.global": "Ethereum",
  "https://safe-transaction-goerli.safe.global/": "Goerli",
  "https://safe-transaction-polygon.safe.global": "Polygon",
  "https://safe-transaction-arbitrum.safe.global": "Arbitrum",
  "https://safe-transaction-optimism.safe.global": "Optimism",
};

export const networkUrlMap = {
  1: "https://safe-transaction.mainnet.gnosis.io",
  5: "https://safe-transaction-goerli.safe.global",
  137: "https://safe-transaction.polygon.gnosis.io",
  42161: "https://safe-transaction-arbitrum.safe.global",
  10: "https://safe-transaction-optimism.safe.global",
};

export const createOrFindGnosisSafe = async (
  company: Company,
  safeInfoRequest: GnosisSafeInfoResponse,
  wallet: UserWallet
) => {
  const knex = await getKnexClient();

  const safeExist = await knex<GnosisSafeInfo>(DBModels.GNOSIS_SAFES)
    .where({ address: safeInfoRequest.address, companyOwner: company.id })
    .first();

  if (safeExist) return Promise.resolve();

  const gnosisSafeInsert = await knex<GnosisSafeInfo>(DBModels.GNOSIS_SAFES)
    .insert({
      address: safeInfoRequest.address,
      nonce: safeInfoRequest.nonce,
      threshold: safeInfoRequest.threshold,
      masterCopy: safeInfoRequest.masterCopy,
      fallbackHandler: safeInfoRequest.fallbackHandler,
      guard: safeInfoRequest.guard,
      version: safeInfoRequest.version,
      network: safeInfoRequest.network,
      chainId:
        chainIdMap[
          safeInfoRequest.network as
            | "https://safe-transaction-mainnet.safe.global"
            | "https://safe-transaction-polygon.safe.global"
            | "https://safe-transaction-arbitrum.safe.global"
            | "https://safe-transaction-optimism.safe.global"
        ],
      companyOwner: company.id,
      importedBy: wallet.id,
    })
    .returning("*");

  const gnosisSafe = gnosisSafeInsert[0];

  const safeOwners = [];

  for (const owner of safeInfoRequest.owners) {
    const ownerInfo: GnosisSafeOwner = {
      ownerAddress: owner,
      gnosisSafeId: gnosisSafe.id,
    };

    const safeOwnerExists = await knex<GnosisSafeOwner>(
      DBModels.GNOSIS_SAFE_OWNERS
    )
      .where(ownerInfo)
      .first();

    if (safeOwnerExists) continue;

    safeOwners.push(
      knex<GnosisSafeOwner>(DBModels.GNOSIS_SAFE_OWNERS).insert(ownerInfo)
    );
  }

  return Promise.all(safeOwners);
};

export const createOrFindTransaction = async (
  transaction: GnosisSafeTransaction
) => {
  const knex = await getKnexClient();
  const transactionExists = await knex<GnosisSafeTransaction>(
    DBModels.GNOSIS_SAFE_TRANSACTIONS
  )
    .where({
      txnHash: transaction.txnHash,
    })
    .first();

  if (transactionExists) return transactionExists;

  const insertedTransaction = await knex<GnosisSafeTransaction>(
    DBModels.GNOSIS_SAFE_TRANSACTIONS
  )
    .insert(transaction)
    .returning("*");

  return insertedTransaction[0];
};

export const createOrFindTransfer = async (
  transfer: GnosisSafeTransactionsTransfers
) => {
  const knex = await getKnexClient();

  const transferExists = await knex<GnosisSafeTransactionsTransfers>(
    DBModels.GNOSIS_SAFE_TRANSACTIONS_TRANSFERS
  )
    .where({
      transactionHash: transfer.transactionHash,
      valueUSD: transfer.valueUSD,
      tokenAddress: transfer.tokenAddress,
    })
    .first();

  if (transferExists) return transferExists;

  const newTransfer = await knex<GnosisSafeTransactionsTransfers>(
    DBModels.GNOSIS_SAFE_TRANSACTIONS_TRANSFERS
  )
    .insert(transfer)
    .returning("*");

  return newTransfer[0];
};

export const createOrFindTransactions = async (
  transactions: Array<GnosisSafeTransaction>
) => {
  const knex = await getKnexClient();
  const toInsert = [];

  for (const transaction of transactions) {
    const transactionExists = await knex<GnosisSafeTransaction>(
      DBModels.GNOSIS_SAFE_TRANSACTIONS
    )
      .where({
        txnHash: transaction.txnHash,
      })
      .first();

    if (transactionExists) continue;
    toInsert.push(transaction);
  }
  if (toInsert.length === 0) return Promise.resolve();

  return knex<GnosisSafeTransaction>(DBModels.GNOSIS_SAFE_TRANSACTIONS).insert(
    toInsert
  );
};

export const getActiveSafes = async (companyOwner: number) => {
  const knex = await getKnexClient();
  return knex<GnosisSafeInfo>(DBModels.GNOSIS_SAFES).where({
    isActive: true,
  });
};

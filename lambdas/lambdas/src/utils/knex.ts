import knex, { Knex } from "knex";
import getSecret, { StoreSecrets } from ".";
import { DBSecrets } from "../models/secrets";
import {
  AuthCode,
  Company,
  Erc20TokenInfo,
  ERC20HistoricalPrice,
  GnosisSafeBalanceHistory,
  GnosisSafeInfo,
  GnosisSafeTransaction,
  GnosisSafeTransactionsTransfers,
  GnosisSafeOwner,
  User,
  UserWallet,
  TransactionCategory,
  TransactionFilter,
  UserFiles,
  CompanyGraphs,
} from "../models/db";

export enum DBModels {
  AUTH_CODES = "authCodes",
  COMPANY = "company",
  COMPANY_GRAPHS = "companyGraphs",
  GNOSIS_SAFES = "gnosisSafes",
  GNOSIS_SAFE_OWNERS = "gnosisSafesOwners",
  USER_WALLETS = "userWallets",
  USERS = "users",
  ERC20_TOKEN_INFO = "erc20TokenInfo",
  ERC20_HISTORICAL_PRICE = "erc20HistoricalPrice",
  GNOSIS_SAFE_BALANCE_HISTORY = "gnosisSafeBalanceHistory",
  GNOSIS_SAFE_TRANSACTIONS = "gnosisSafeTransactions",
  GNOSIS_SAFE_TRANSACTIONS_TRANSFERS = "gnosisSafeTransactionsTransfers",
  TRANSACTION_CATEGORIES = "transactionCategories",
  TRANSACTION_FILTERS = "transactionFilters",
  USER_FILES = "userFiles",
}

let client: Knex;

const getKnexClient = async () => {
  if (client === undefined) {
    const { host, user, password, database } = (await getSecret(
      StoreSecrets.POSTGRES
    )) as DBSecrets;

    client = knex({
      client: "pg",
      connection: {
        host: host,
        port: 5432,
        user: user,
        password: password,
        database: database || "postgres",
      },
    });
  }

  return Promise.resolve(client);
};

export const getPreloadedClient = async () => {
  const knex = await getKnexClient();

  // without a function call, queries after the initial query tend to fail.  No idea why
  const models = {
    AUTH_CODES: () => knex<AuthCode>(DBModels.AUTH_CODES),
    COMPANY: () => knex<Company>(DBModels.COMPANY),
    COMPANY_GRAPHS: () => knex<CompanyGraphs>(DBModels.COMPANY_GRAPHS),
    GNOSIS_SAFES: () => knex<GnosisSafeInfo>(DBModels.GNOSIS_SAFES),
    TRANSACTION_CATEGORIES: () =>
      knex<TransactionCategory>(DBModels.TRANSACTION_CATEGORIES),
    GNOSIS_SAFE_OWNERS: () =>
      knex<GnosisSafeOwner>(DBModels.GNOSIS_SAFE_OWNERS),
    USER_WALLETS: () => knex<UserWallet>(DBModels.USER_WALLETS),
    USERS: () => knex<User>(DBModels.USERS),
    ERC20_TOKEN_INFO: () => knex<Erc20TokenInfo>(DBModels.ERC20_TOKEN_INFO),
    ERC20_HISTORICAL_PRICE: () =>
      knex<ERC20HistoricalPrice>(DBModels.ERC20_HISTORICAL_PRICE),
    GNOSIS_SAFE_BALANCE_HISTORY: () =>
      knex<GnosisSafeBalanceHistory>(DBModels.GNOSIS_SAFE_BALANCE_HISTORY),
    GNOSIS_SAFE_TRANSACTIONS: () =>
      knex<GnosisSafeTransaction>(DBModels.GNOSIS_SAFE_TRANSACTIONS),
    GNOSIS_SAFE_TRANSACTIONS_TRANSFERS: () =>
      knex<GnosisSafeTransactionsTransfers>(
        DBModels.GNOSIS_SAFE_TRANSACTIONS_TRANSFERS
      ),
    TRANSACTION_FILTERS: () =>
      knex<TransactionFilter>(DBModels.TRANSACTION_FILTERS),
    USER_FILES: () => knex<UserFiles>(DBModels.USER_FILES),
  };

  return models;
};

export default getKnexClient;

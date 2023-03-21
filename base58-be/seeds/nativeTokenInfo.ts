import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Inserts seed entries

  const tokens = await knex("erc20TokenInfo")
    .where({ tokenId: "matic-network" })
    .orWhere({ tokenId: "ethereum" });

  if (tokens.length === 0) {
    await knex("erc20TokenInfo").insert([
      {
        tokenId: "matic-network",
        symbol: "matic",
        name: "Polygon",
        assetPlatformId: "ethereum ",
        isNative: true,
        chainId: 137,
      },
      {
        tokenId: "ethereum",
        symbol: "eth",
        name: "Ethereum",
        assetPlatformId: "ethereum ",
        isNative: true,
        chainId: 1,
      },
    ]);
  }
}

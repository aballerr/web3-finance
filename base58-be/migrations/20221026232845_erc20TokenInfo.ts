import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("erc20TokenInfo", function (table) {
    table.increments("id").primary();
    table.string("tokenId", 100).unique();
    table.string("symbol", 100).unique();
    table.string("name", 200);
    table.string("assetPlatformId", 100);
    table.string("ethereumAddress", 200).unique();
    table.string("polygonAddress", 200).unique();
    table.string("arbitrumAddress", 200).unique();
    table.string("optimimismAddress", 200).unique();
    table.string("assetSrcImage", 200);
    table.integer("chainId");
    table.boolean("isNative").defaultTo(false);
    table.timestamp("createdAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    table.timestamp("updatedAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("erc20TokenInfo");
}

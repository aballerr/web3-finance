import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("gnosisSafeBalanceHistory", function (table) {
    table.increments("id").primary();
    table.integer("tokenId").references("erc20TokenInfo.id");
    table.integer("gnosisSafeId").references("gnosisSafes.id");
    table.integer("companyId").references("company.id");
    table.string("balance", 40);
    table.string("ethValue", 40);
    table.timestamp("timestamp");
    table.float("fiatBalance");
    table.string("fiatConversion", 40);
    table.string("fiatCode", 40);
    table.string("network", 25);
    table.integer("chainId");
    table.integer("decimals");
    table.boolean("isTotalBalance").defaultTo(false);
    table.boolean("isMostRecent").defaultTo(false);

    table.timestamp("createdAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    table.timestamp("updatedAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("gnosisSafeBalanceHistory");
}

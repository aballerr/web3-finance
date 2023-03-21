import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("erc20HistoricalPrice", function (table) {
    table.increments("id").primary();
    table.string("tokenId", 100);
    table.string("symbol", 100);
    table.float("price");
    table.string("date", 100);
    table.timestamp("createdAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    table.timestamp("updatedAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("erc20HistoricalPrice");
}

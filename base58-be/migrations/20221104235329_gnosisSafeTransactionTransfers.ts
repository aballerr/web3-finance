import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    "gnosisSafeTransactionsTransfers",
    function (table) {
      table.increments("id").primary();
      table
        .integer("gnosisSafeTransaction")
        .references("gnosisSafeTransactions.id");
      table.string("type", 50);
      table.timestamp("executionDate");
      table.string("transactionHash", 100);
      table.string("direction", 20);
      table.string("to", 50);
      table.string("value", 50);
      table.string("decimals", 50);
      table.float("valueUSD");
      table.string("tokenAddress", 50);
      table.string("from", 50);
      table.timestamp("createdAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
      table.timestamp("updatedAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    }
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("gnosisSafeTransactionsTransfers");
}

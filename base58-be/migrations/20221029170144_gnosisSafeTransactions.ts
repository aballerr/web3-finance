import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("gnosisSafeTransactions", function (table) {
    table.increments("id").primary();
    table.integer("gnosisSafeId").references("gnosisSafes.id");
    table.integer("companyId").references("company.id");
    table.string("txnHash", 200);
    table.string("from", 200);
    table.string("to", 200);
    table.timestamp("executionDate");
    table.string("value", 100);
    table.float("valueUSD");
    table.string("txnFee", 20);
    table.float("txnFeeUSD");
    table.integer("chainId");
    table.string("type", 50);
    table.integer("categoryId").references("transactionCategories.id");
    table.string("gnosisType", 50);
    table.string("memo", 280);
    table.timestamp("createdAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    table.timestamp("updatedAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("gnosisSafeTransactions");
}

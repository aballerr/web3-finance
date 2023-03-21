import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("userFiles", function (table) {
    table.increments("id").primary();
    table.string("location", 200);
    table.string("fileName", 100);
    table.integer("companyId").references("company.id");
    table.integer("userId").references("users.id");
    table.text("key");
    table.string("bucket", 50);
    table.integer("transactionId").references("gnosisSafeTransactions.id");
    table.string("fileUse", 40);
    table.timestamp("createdAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    table.timestamp("updatedAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("userFiles");
}

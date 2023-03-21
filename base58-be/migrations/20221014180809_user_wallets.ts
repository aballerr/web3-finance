import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("userWallets", function (table) {
    table.increments("id").primary();
    table.string("walletAddress", 100).notNullable();
    table.string("walletName", 50);
    table.integer("walletOwner").references("users.id");
    table.string("walletType", 40);
    table.timestamp("createdAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    table.timestamp("updatedAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("userWallets");
}

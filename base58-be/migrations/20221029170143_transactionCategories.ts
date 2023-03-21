import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("transactionCategories", function (table) {
    table.increments("id").primary();
    table.integer("companyId").references("company.id");
    table.string("categoryName");
    table.string("backgroundColor", 30);
    table.string("textColor", 30);
    table.timestamp("createdAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    table.timestamp("updatedAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("transactionCategories");
}

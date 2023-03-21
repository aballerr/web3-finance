import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("companyGraphs", function (table) {
    table.increments("id").primary();
    table.integer("companyId").references("company.id");
    table.integer("userId").references("users.id");
    table.string("graphType", 50);
    table.integer("position");
    table.timestamp("createdAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    table.timestamp("updatedAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("companyGraphs");
}

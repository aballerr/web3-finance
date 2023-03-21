import { Knex } from "knex";

// table.string("email", 100).notNullable().references("users.email");
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("company", function (table) {
    table.increments("id").primary();
    table.string("companyName", 100).notNullable();
    table.integer("owner").references("users.id");
    table.boolean("setupComplete").notNullable();
    table.timestamp("createdAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    table.timestamp("updatedAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("company");
}

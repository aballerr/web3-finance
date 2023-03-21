import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("gnosisSafesOwners", function (table) {
    table.increments("id").primary();
    table.integer("gnosisSafeId").references("gnosisSafes.id");
    table.string("ownerAddress", 50);
    table.string("ownerName", 50);
    table.timestamp("createdAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    table.timestamp("updatedAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("gnosisSafesOwners");
}

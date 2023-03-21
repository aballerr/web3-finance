import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("gnosisSafes", function (table) {
    table.increments("id").primary();
    table.string("address", 50).notNullable();
    table.string("gnosisSafeName", 50);
    table.string("nonce", 50);
    table.string("threshold", 50);
    table.string("masterCopy", 50);
    table.string("fallbackHandler", 50);
    table.string("guard", 50);
    table.string("version", 50);
    table.string("network", 50);
    table.integer("chainId");
    table.boolean("isActive").defaultTo(false);
    table.integer("companyOwner").references("company.id");
    table.integer("importedBy").references("userWallets.id");
    table.boolean("createdInBase58").defaultTo(false);
    table.timestamp("createdAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    table.timestamp("updatedAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("gnosisSafes");
}

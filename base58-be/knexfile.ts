import type { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config();

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "postgresql",
    connection: {
      database: "docker",
      user: "docker",
      password: "docker",
    },
  },
  staging: {
    client: "postgresql",
    connection: {
      database: "postgres",
      user: process.env.host,
      password: process.env.password,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },

  production: {
    client: "postgresql",
    connection: {
      host: process.env.prodhost,
      database: "postgres",
      user: process.env.produser,
      password: process.env.prodpassword,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};

module.exports = config;

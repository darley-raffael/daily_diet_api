import { Knex } from "knex";
import { env } from "./src/env";

const knexConfig: Knex.Config = {
  client: "sqlite3",
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: { directory: "./src/db/migrations" },
};

export default knexConfig;

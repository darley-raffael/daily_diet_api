import knexConfig from "../../knexfile";
import { knex as setupKnex } from "knex";

export const knex = setupKnex(knexConfig);

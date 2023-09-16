import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("daily_meals", (table) => {
    table.uuid("id").primary();
    table.uuid("session_id").index();
    table.string("name").notNullable();
    table.string("description").notNullable();
    table.boolean("is_on_the_diet").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
    table.uuid("user_id").references("id").inTable("users");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("daily_meals");
}

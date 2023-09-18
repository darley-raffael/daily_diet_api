import { Knex } from "knex";

// Add column date_diet to table daily_meals
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("daily_meals", (table) => {
    table.string("date_diet").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("daily_meals", (table) => {
    table.dropColumn("date_diet");
  });
}

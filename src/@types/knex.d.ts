import { knex } from "knex";

declare module "knex/types/tables" {
  interface Tables {
    daily_meals: {
      id: string;
      session_id?: string;
      name: string;
      description: string;
      is_on_the_diet: boolean;
      user_id?: string;
      created_at: string;
      updated_at: string;
    };

    users: {
      id: string;
      session_id?: string;
      name: string;
      email: string;
      password: string;
      created_at: string;
      updated_at: string;
    };
  }
}

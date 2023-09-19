import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { knex } from "../db";
import { randomUUID } from "node:crypto";

export class DailyMealsController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const createMeatsBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date_meal: z.string().datetime({ message: "Invalid date" }),
      is_on_the_diet: z.boolean(),
    });

    const { name, description, date_meal, is_on_the_diet } =
      createMeatsBodySchema.parse(request.body);

    let { sessionId } = request.cookies;
    if (!sessionId) {
      sessionId = randomUUID();
      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    const userId = await knex("users")
      .select("id")
      .where({ session_id: sessionId })
      .first();

    await knex("daily_meals").insert({
      id: randomUUID(),
      session_id: sessionId,
      name,
      description,
      date_diet: date_meal,
      is_on_the_diet,
      user_id: userId?.id,
    });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const deleteMeatsBodySchema = z.object({
      id: z.string().uuid({ message: "Invalid id" }),
    });

    const { id } = deleteMeatsBodySchema.parse(request.params);
    const searchMeal = await knex("daily_meals").where({ id }).first();
    if (!searchMeal) {
      return reply.status(404).send({
        message: "Meal not found",
      });
    }

    await knex("daily_meals").where({ id }).delete();

    return reply.status(200).send({
      meal_id: id,
      message: "Meal deleted",
    });
  }

  async summary(request: FastifyRequest) {
    const { sessionId } = request.cookies;

    const summary = await knex("daily_meals")
      .select("id", "name", "description", "is_on_the_diet", "date_diet")
      .where({ session_id: sessionId });

    return {
      summary,
    };
  }

  async show(request: FastifyRequest, reply: FastifyReply) {
    const searchMealsIdParamsSchema = z.object({
      id: z.string().uuid({ message: "Invalid id" }),
    });

    const { id } = searchMealsIdParamsSchema.parse(request.params);

    const dailyMeal = await knex("daily_meals").where({ id }).first();
    if (!dailyMeal) {
      return reply.status(404).send({
        message: "Meal not found",
      });
    }

    return { dailyMeal };
  }

  async updateAll(request: FastifyRequest, reply: FastifyReply) {
    const updateMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date_meal: z.string().datetime({ message: "Invalid date" }),
      is_on_the_diet: z.boolean(),
    });

    const searchMealIdParamsSchema = z.object({
      id: z.string().uuid({ message: "Invalid id" }),
    });

    const { id } = searchMealIdParamsSchema.parse(request.params);

    const { name, description, date_meal, is_on_the_diet } =
      updateMealBodySchema.parse(request.body);

    let { sessionId } = request.cookies;
    if (!sessionId) {
      sessionId = randomUUID();
      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("daily_meals").where({ session_id: sessionId, id }).update({
      name,
      description,
      date_diet: date_meal,
      is_on_the_diet,
      session_id: sessionId,
      updated_at: knex.fn.now(),
    });
  }
}

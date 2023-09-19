import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { knex } from "../db";
import { randomUUID } from "node:crypto";
import { bestSequenceDiet } from "../services/bestSequenceDiet";

export class UserController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().length(8),
      password_confirm: z.string(),
    });

    const { name, email, password, password_confirm } =
      createUserBodySchema.parse(request.body);

    const checkEmailExists = await knex("users").where({ email }).first();
    if (checkEmailExists) {
      return reply.status(400).send({
        message: "Email already exists",
      });
    }

    if (password !== password_confirm) {
      return reply.status(400).send({
        message: "Passwords do not match",
      });
    }

    const { bcryptHash } = request;
    const hashedPassword = await bcryptHash(password);

    let sessionId = request.cookies.sessionId;
    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("users").insert({
      id: randomUUID(),
      name,
      email,
      password: hashedPassword,
      session_id: sessionId,
    });

    return reply.status(201).send({
      message: "User created",
    });
  }

  async updateAll(request: FastifyRequest, reply: FastifyReply) {
    const updateUserBodySchema = z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      old_password: z.string().optional(),
      new_password: z.string().min(8).optional(),
    });

    const userIdParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = userIdParamsSchema.parse(request.params);

    const user = await knex("users").where({ id }).first();
    if (!user) {
      return reply.status(404).send({
        message: "User not found",
      });
    }

    const { name, email, old_password, new_password } =
      updateUserBodySchema.parse(request.body);

    if (email) {
      const checkEmailExists = await knex("users").where({ email }).first();
      if (checkEmailExists) {
        return reply.status(400).send({
          message: "Email already exists",
        });
      }
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if (new_password && !old_password) {
      return reply.status(400).send({
        message: "Old password is required",
      });
    }

    if (new_password && old_password) {
      const checkOldPassword = request.bcryptCompare(
        old_password,
        user.password
      );
      if (!checkOldPassword) {
        return reply.status(400).send({
          message: "Old password is incorrect",
        });
      }

      user.password = await request.bcryptHash(new_password);
    }

    await knex("users").where({ id }).update({
      name: user.name,
      email: user.email,
      password: user.password,
      updated_at: knex.fn.now(),
    });

    return reply.status(200).send({
      message: "User updated",
    });
  }

  async metrics(request: FastifyRequest, reply: FastifyReply) {
    const userIdBodySchema = z.object({
      id: z.string().uuid({ message: "Invalid id" }),
    });

    const { id } = userIdBodySchema.parse(request.params);
    const user = await knex("users").where({ id }).first();
    if (!user) {
      return reply.status(404).send({
        message: "User not found",
      });
    }

    /* 
    - Deve ser possível recuperar as métricas de um usuário:
    - ✅ Quantidade total de refeições registradas
    - ✅ Quantidade total de refeições dentro da dieta
    - Quantidade total de refeições fora da dieta
    - Melhor sequência de refeições dentro da dieta
    */
    const metrics = await knex("daily_meals")
      .where({ user_id: id })
      .count("id", { as: "count_meals" })
      .sum("is_on_the_diet", { as: "meals_in_diet" })
      .first();

    if (!metrics) {
      return reply.status(404).send({
        message: "Metrics not found",
      });
    }
    const offDietMeal = metrics
      ? Number(metrics.count_meals) - Number(metrics.meals_in_diet)
      : 0;

    const bestSequenceDietMetrics = await bestSequenceDiet(id);

    return {
      metrics: {
        count_meals: metrics.count_meals,
        meals_in_diet: metrics.meals_in_diet,
        off_diet_meal: offDietMeal,
        best_sequence_diet: bestSequenceDietMetrics,
      },
    };
  }
}

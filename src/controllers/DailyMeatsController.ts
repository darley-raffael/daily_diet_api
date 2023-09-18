import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export class DailyMeatsController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const createMeatsBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      hours: z.string(),
      is_on_the_diet: z.boolean(),
    });
  }
}

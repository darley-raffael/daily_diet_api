import { FastifyInstance } from "fastify";
import { UserController } from "../controllers/UserController";

const userController = new UserController();

export async function usersRoutes(app: FastifyInstance) {
  app.post("/", userController.create);
  app.put("/:id", userController.updateAll);
}

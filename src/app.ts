import fastify from "fastify";
import cookie from "@fastify/cookie";
import bc from "fastify-bcrypt";
import { usersRoutes } from "./routes/users.routes";

export const app = fastify();

app.register(cookie);
app.register(bc);
app.register(usersRoutes, { prefix: "/users" });

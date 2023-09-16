import { app } from "./app";
import { env } from "./env";

app.listen({ port: env.PORT }).then(() => {
  console.log(`🚀Server started on port http://localhost:${env.PORT}`);
});

import { DailyMealsController } from "../controllers/DailyMealsController";

const dayMealsController = new DailyMealsController();

export async function dailyDietRoutes(app: any) {
  app.post("/", dayMealsController.create);
  app.delete("/:id", dayMealsController.delete);
  app.get("/summary", dayMealsController.summary);
  app.get("/:id", dayMealsController.show);
  app.put("/:id", dayMealsController.updateAll);
}

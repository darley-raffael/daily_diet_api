import { knex } from "../db";

export const bestSequenceDiet = async (userId: string) => {
  const meals = await knex("daily_meals")
    .where({ user_id: userId })
    .orderBy("date_diet", "asc");

  let maxStreak = 0;
  let currentStreak = 0;

  for (let meal of meals) {
    if (meal.is_on_the_diet) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
};

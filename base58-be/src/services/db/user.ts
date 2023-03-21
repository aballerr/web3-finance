import { createOrFindCompany } from "./company";
import { User } from "../../models/db";
import getKnexClient, { DBModels } from "./knex";

// Create the user if it doesn't exist
export const createOrFindUser = async (
  email: string,
  type?: string
): Promise<User> => {
  const knex = await getKnexClient();
  const user = await knex(DBModels.USERS).where({ email }).first();

  if (user === undefined) {
    const newUser = await knex(DBModels.USERS)
      .insert({ email, type })
      .returning("*");

    await createOrFindCompany(newUser[0]);
    return Promise.resolve(newUser[0]);
  } else {
    return Promise.resolve(user);
  }
};

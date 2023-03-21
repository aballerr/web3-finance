import getKnexClient from "./knex";

import { Company, User } from "../../models/db";

export const createOrFindCompany = async (user: User): Promise<Company> => {
  const knex = await getKnexClient();
  const email = user.email;
  const companyName = email.split("@")[1].split(".")[0];

  const company = await knex<Company>("company")
    .where({
      companyName,
    })
    .first();
  if (company) return company;

  const insertedCompany = await knex("company")
    .insert({
      companyName,
      owner: user.id,
      setupComplete: false,
    })
    .returning("*");

  return Promise.resolve(insertedCompany[0]);
};

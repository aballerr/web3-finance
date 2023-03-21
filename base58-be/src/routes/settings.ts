import express from "express";
import { User } from "../models/db";
import { createOrFindCompany } from "../services/db/company";
import { getPreloadedClient } from "../services/db/knex";

const router = express.Router();

router.post("/company-graphs", async (req, res) => {
  const { graphType, position } = req.body;
  const user = req.user as User;
  const knex = await getPreloadedClient();
  const company = await createOrFindCompany(user);

  try {
    const graphExists = await knex
      .COMPANY_GRAPHS()
      .where({
        companyId: company.id,
        position,
      })
      .first();

    graphExists
      ? await knex
          .COMPANY_GRAPHS()
          .where({
            companyId: company.id,
            position,
          })
          .update({ userId: user.id, graphType })
      : await knex.COMPANY_GRAPHS().insert({
          userId: user.id,
          graphType,
          companyId: company.id,
          position,
        });

    res.send({ success: true });
  } catch (err) {
    res.send({ success: false });
  }
});

router.get("/company-graphs", async (req, res) => {
  const user = req.user as User;
  const knex = await getPreloadedClient();
  const company = await createOrFindCompany(user);

  try {
    const graphs = await knex
      .COMPANY_GRAPHS()
      .where({ companyId: company.id })
      .orderBy("position", "asc");

    res.send({ success: true, graphs });
  } catch (err) {
    res.send({ success: false });
  }
});

export default router;

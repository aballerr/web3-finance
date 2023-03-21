import express from "express";
import getKnexClient, { getPreloadedClient } from "../services/db/knex";
import { User } from "../models/db";
import { createOrFindCompany } from "../services/db/company";

const router = express.Router();

const getKey = (chainId: number) => {
  if (chainId === 137) {
    return "polygonAddress";
  } else if (chainId === 42161) {
    return "arbitrumAddress";
  } else if (chainId === 10) {
    return "optimismADdress";
  }

  return "ethereumAddress";
};

router.get("/currencies", async (req, res) => {
  const knex = await getKnexClient();
  const knexPreload = await getPreloadedClient();
  const user = req.user as User;
  const company = await createOrFindCompany(user);

  const query = `
  select DISTINCT "tokenAddress", "chainId" from "gnosisSafeTransactions" 
  inner join "gnosisSafeTransactionsTransfers" on "gnosisSafeTransactionsTransfers"."gnosisSafeTransaction" = "gnosisSafeTransactions".id
  where "companyId" = ${company.id};
 `;

  const { rows } = await knex.raw(query);

  for (const row of rows) {
    const key = getKey(row.chainId);

    const tokenInfo =
      row.tokenAddress !== null
        ? await knexPreload
            .ERC20_TOKEN_INFO()
            .where({
              [key]: row.tokenAddress.toLowerCase(),
            })
            .first()
        : await knexPreload
            .ERC20_TOKEN_INFO()
            .where({
              chainId: row.chainId === 137 ? 137 : 1,
            })
            .first();

    row.name = tokenInfo?.name;
  }

  res.send({ success: true, currencies: rows });
});

export default router;

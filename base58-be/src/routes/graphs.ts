import express from "express";
import knex from "knex";
import fetch from "node-fetch";
import { User } from "../models/db";
import { createOrFindCompany } from "../services/db/company";
import { networkNameMap } from "../services/db/gnosis-safe";
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

router.get("/safe-balances", async (req, res) => {
  const user = req.user as User;
  const knex = await getPreloadedClient();
  const company = await createOrFindCompany(user);
  const safes = await knex
    .GNOSIS_SAFES()
    .where({ companyOwner: company.id, isActive: true });

  const allAssets = [];

  for (const safe of safes) {
    const url = `${safe.network}/api/v1/safes/${safe.address}/balances/usd/?trusted=false&exclude_spam=false`;

    // @ts-ignore
    const network = networkNameMap[safe.network];
    const assets = await fetch(url).then((res) => res.json());

    const finalAssets = {
      network,
      chainId: safe.chainId,
      assets,
    };

    allAssets.push(finalAssets);
  }

  res.send({ success: true, allAssets });
});

router.get("/safe-balances/new", async (req, res) => {
  const user = req.user as User;
  const knex = await getPreloadedClient();
  const company = await createOrFindCompany(user);
  const safes = await knex
    .GNOSIS_SAFES()
    .where({ companyOwner: company.id, isActive: true });

  const balances = await knex
    .GNOSIS_SAFE_BALANCE_HISTORY()
    .select("*")
    .select("gnosisSafeBalanceHistory.chainId as chainId")
    .where({ companyId: company.id, isTotalBalance: true, isMostRecent: true })
    .innerJoin(
      "erc20TokenInfo",
      "erc20TokenInfo.id",
      "gnosisSafeBalanceHistory.tokenId"
    )
    .orderBy("fiatBalance", "desc");

  res.send({ success: true, balances });
});

router.delete("/company-graph", async (req, res) => {
  const user = req.user as User;
  const knex = await getPreloadedClient();
  const company = await createOrFindCompany(user);
  const { position } = req.body;

  try {
    await knex
      .COMPANY_GRAPHS()
      .where({ companyId: company.id, position })
      .delete();

    res.send({ success: true });
  } catch (err) {
    res.send({ success: false });
  }
});

export default router;

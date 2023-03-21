import express from "express";
import fetch from "node-fetch";
import getKnexClient, { DBModels } from "../services/db/knex";
import { createOrFindCompany } from "../services/db/company";
import { GnosisSafeInfoResponse, SafeCreateRequest } from "../models";
import { User, UserWallet } from "../models/db";
import { GnosisSafeInfo, GnosisSafeOwner } from "../models/db";
import _ from "lodash";

import {
  createOrFindGnosisSafe,
  networkUrlMap,
} from "../services/db/gnosis-safe";
import {
  ALL_NETWORKS,
  importAllSafeTransactions,
  updateSafeBalances,
} from "../services/gnosis";
import { addMessageToQueue, SQS_URLS } from "../services/sqs";

const { devmode } = process.env;
const router = express.Router();

const networks = ALL_NETWORKS;

// duplicate calls get made to this endpoint, it results in a weird bug during the onboarding flow
// where you can switch wallets to import and another wallets safes are imported instead
interface CheckedAccount {
  [key: string]: Date;
}

const checked: CheckedAccount = {};

router.get("/onboard/:address", async (req, res) => {
  const { address } = req.params;
  try {
    const safesInfo: Array<GnosisSafeInfoResponse> = [];
    const user = req.user as User;
    const knex = await getKnexClient();
    const lastRequest = checked[`${user.id}-${address}`];

    if (lastRequest) {
      const diff = new Date().valueOf() - new Date(lastRequest).valueOf();
      if (diff < 30000)
        return res.send({ success: true, checkedAccount: true });
    }

    checked[`${user.id}-${address}`] = new Date();

    for (const network of networks) {
      console.log(`checking network: ${network}`);
      const request = `${network}/api/v1/owners/${address}/safes/`;
      const { safes } = await fetch(request).then((res) => res.json());

      for (let safe of safes) {
        const safeInfoRequest = `${network}/api/v1/safes/${safe}/`;
        const safeInfo = await fetch(safeInfoRequest).then((res) => res.json());
        safeInfo.network = network;
        safesInfo.push(safeInfo);
      }
    }

    const company = await createOrFindCompany(user as User);
    let wallet = await knex<UserWallet>(DBModels.USER_WALLETS)
      .where({
        walletOwner: user.id,
        walletAddress: address,
      })
      .first();

    if (!wallet) {
      console.log("/gnosis-safe/:address no user wallet");

      const newWallet = await knex<UserWallet>(DBModels.USER_WALLETS)
        .insert({
          walletOwner: user.id,
          walletAddress: address,
        })
        .returning("*");
      wallet = newWallet[0];
    }

    const allSafeCreations = [];

    if (safesInfo.length === 0) {
      return res.send({ safes: [], success: true });
    }

    for (const safeInfo of safesInfo) {
      allSafeCreations.push(createOrFindGnosisSafe(company, safeInfo, wallet));
    }

    await Promise.all(allSafeCreations);

    const owners = await knex<GnosisSafeOwner>(
      DBModels.GNOSIS_SAFE_OWNERS
    ).where({ ownerAddress: wallet.walletAddress });

    const allSafes = [];

    for (let owner of owners) {
      const safe = await knex<GnosisSafeInfo>(DBModels.GNOSIS_SAFES)
        .where({ id: owner.gnosisSafeId })
        .first();

      if (safe) {
        const safeOwners = await knex<GnosisSafeOwner>(
          DBModels.GNOSIS_SAFE_OWNERS
        ).where({ gnosisSafeId: safe.id });

        safe.owners = safeOwners;

        allSafes.push(safe);
      }
    }

    res.send({ safes: allSafes, success: true });
  } catch (err) {
    console.log(err);
    console.log("gnosis-safe/onboard/:address");
    res.send({ success: false });
  }
});

router.get("/", async (req, res) => {
  try {
    const knex = await getKnexClient();
    const user = req.user as User;
    const company = await knex(DBModels.COMPANY)
      .where({ owner: user.id })
      .first();

    const safes = await knex<GnosisSafeInfo>(DBModels.GNOSIS_SAFES).where({
      companyOwner: company.id,
      isActive: true,
    });
    res.send({ safes, success: true });
  } catch (err) {
    res.send({ success: false });
  }
});

const updateAll = async (companyId: number) => {
  await importAllSafeTransactions(companyId);
  await updateSafeBalances(companyId);
};

// simply updates the safe to be "imported" for returning relevant information
router.post("/import", async (req, res) => {
  try {
    const { safesToImport } = req.body;

    if (safesToImport.length === 0) res.send({ success: true });

    const user = req.user as User;
    const knex = await getKnexClient();
    const company = await createOrFindCompany(user);

    for (const safeToImport of safesToImport) {
      const { address } = safeToImport;

      await knex(DBModels.GNOSIS_SAFES)
        .where({
          address,
          companyOwner: company.id,
        })
        .update({ isActive: safeToImport.isActive });
    }

    if (devmode) {
      updateAll(company.id);
    } else {
      addMessageToQueue(company.id, SQS_URLS.TRANSACTIONS_QUEUE);
      addMessageToQueue(company.id, SQS_URLS.BALANCE_QUEUES);
    }

    res.send({ success: true });
  } catch (err) {
    console.log(err);
    console.log("/gnosis-safe/import: failing");
    res.send({ success: false });
  }
});

// route for safes created on OUR frontend
router.post("/create", async (req, res) => {
  try {
    const { safeCreateRequest }: { safeCreateRequest: SafeCreateRequest } =
      req.body;

    const user = req.user as User;
    const knex = await getKnexClient();
    const company = await knex(DBModels.COMPANY)
      .where({ owner: user.id })
      .first();

    const gnosisSafe = await knex(DBModels.GNOSIS_SAFES)
      .insert({
        address: safeCreateRequest.address,
        gnosisSafeName: safeCreateRequest.gnosisSafeName,
        nonce: safeCreateRequest.nonce,
        threshold: safeCreateRequest.threshold,
        masterCopy: "",
        fallbackHandler: "",
        guard: safeCreateRequest.guard,
        version: safeCreateRequest.version,
        network:
          networkUrlMap[safeCreateRequest.chainId as 1 | 137 | 42161 | 10],
        chainId: safeCreateRequest.chainId,
        isActive: true,
        companyOwner: company.id,
        importedBy: user.id,
        createdInBase58: true,
      })
      .returning("*");

    const { owners } = safeCreateRequest;
    const safe = gnosisSafe[0];

    for (const owner of owners) {
      await knex<GnosisSafeOwner>(DBModels.GNOSIS_SAFE_OWNERS).insert({
        gnosisSafeId: safe.id,
        ownerAddress: owner.address,
        ownerName: owner.name,
      });
    }

    res.send({ success: true });
  } catch (err) {
    console.log(err);
    console.log("POST: /gnosis-safe/create: failing");
    res.send({ success: false });
  }
});

router.get("/created", async (req, res) => {
  try {
    const knex = await getKnexClient();
    const user = req.user as User;
    const company = await knex(DBModels.COMPANY)
      .where({ owner: user.id })
      .first();

    const safes = await knex<GnosisSafeInfo>(DBModels.GNOSIS_SAFES).where({
      companyOwner: company.id,
      createdInBase58: true,
    });

    const allSafes = [];
    for (const safe of safes) {
      const owners = await knex<GnosisSafeOwner>(
        DBModels.GNOSIS_SAFE_OWNERS
      ).where({ gnosisSafeId: safe.id });
      const final = { ...safe, owners };
      allSafes.push(final);
    }

    res.send({ success: true, safes: allSafes });
  } catch (err) {
    console.log(err);
    console.log("GET: /gnosis-safe/creat: failing");

    res.send({ success: false });
  }
});

export default router;

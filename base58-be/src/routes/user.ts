import express, { Request, Response } from "express";

import { User, UserWallet } from "../models/db";
import getKnexClient, { DBModels } from "../services/db/knex";

const router = express.Router();

interface WalletRequest {
  walletAddress: string;
  walletType: string;
  walletName?: string;
}

router.post("/wallet", async (req: Request, res: Response) => {
  try {
    const knex = await getKnexClient();
    const { email } = req.user as User;
    const { walletAddress, walletType, walletName } = req.body as WalletRequest;
    const user = await knex<User>(DBModels.USERS).where({ email }).first();

    if (user) {
      const walletExists = await knex(DBModels.USER_WALLETS)
        .where({
          walletOwner: user.id,
          walletAddress,
        })
        .update({ walletName });

      if (walletExists) {
        const wallets = await knex<UserWallet>(DBModels.USER_WALLETS).where({
          walletOwner: user.id,
        });

        res.send({ success: true, wallets });
      } else {
        const userWallet = {
          walletAddress,
          walletType,
          walletName,
          walletOwner: user.id,
        };

        await knex(DBModels.USER_WALLETS).insert(userWallet);

        const wallets = await knex<UserWallet>(DBModels.USER_WALLETS).where({
          walletOwner: user.id,
        });

        res.send({ succes: true, wallets });
      }
    } else {
      res.send({ succes: false });
    }
  } catch (err) {
    console.log(err);
    console.log("/wallet: Creating wallet failed");
    res.send({ success: false });
  }
});

router.get("/info", async (req: Request, res: Response) => {
  const knex = await getKnexClient();
  const user = req.user as User;

  const wallets = await knex<UserWallet>(DBModels.USER_WALLETS).where({
    walletOwner: user.id,
  });

  res.send({ success: true, wallets });
});

router.get("/wallet/:address", async (req: Request, res: Response) => {
  try {
    const knex = await getKnexClient();
    const user = req.user as User;
    const walletAddress = req.params.address;

    const request = {
      walletAddress,
      walletOwner: user.id,
    };

    const wallet = await knex(DBModels.USER_WALLETS).where(request).first();

    res.send({ success: true, wallet });
  } catch (err) {
    console.log(err);
    console.log("user/wallet/:address: errored out");

    res.send({ success: false });
  }
});

router.post("/complete-flow", async (req: Request, res: Response) => {
  try {
    const knex = await getKnexClient();
    const user = req.user as User;
    const company = await knex(DBModels.COMPANY)
      .where({ owner: user.id })
      .first()
      .update({ setupComplete: true })
      .returning("*");

    res.send({ success: true });
  } catch (err) {
    console.log(err);
    console.log("/complete-flow: Creating wallet failed");
    res.send({ success: false });
  }
});

export default router;

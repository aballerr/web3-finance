import express, { NextFunction, Request, Response } from "express";
import { sendEmail, verifyCode } from "../services/auth/multiFactorAuth";
import passport from "passport";
import jwt from "jsonwebtoken";
import getSecret, { StoreSecrets } from "../services/secrets";
import { getCompanyName } from "../utils/index";
import getKnexClient, { DBModels } from "../services/db/knex";
import { Company, User, UserWallet } from "../models/db";
import { createOrFindUser } from "../services/db/user";
import { createOrFindCompany } from "../services/db/company";

const router = express.Router();

router.get("/login/success", (req: Request, res: Response) => {
  if (req.user) {
    res.status(200).json({
      succes: true,
      message: "successful",
      user: req.user,
    });
  } else {
    res.status(200).json({
      success: false,
      message: "not logged in",
    });
  }
});

router.post("/email/createcode", async (req: Request, res: Response) => {
  const { email } = req.body;

  const { success, error } = await sendEmail(email);
  const response = error ? { success, error } : { success };

  res.send(response);
});

router.post("/email/checkcode", async (req: Request, res: Response) => {
  const { email, code } = req.body;
  const { success, token, user } = await verifyCode({ email, code });
  if (!user) {
    return res.send({ success: false, error: "user not created" });
  }

  const knex = await getKnexClient();
  const wallets = await knex<UserWallet>(DBModels.USER_WALLETS).where({
    walletOwner: user.id,
  });

  const company = await createOrFindCompany(user);
  const isSetup = user.id !== company.owner || company.setupComplete;

  res.send({ success, token, setup: isSetup, email: user.email, wallets });
});

interface Secret {
  jwt: string;
}

router.post(
  "/google",
  passport.authenticate("google-token", { session: false }),
  async (req: Request, res: Response) => {
    try {
      const knex = await getKnexClient();
      const secrets = (await getSecret(StoreSecrets.JWT)) as Secret;
      // @ts-ignore
      const { email, picture } = req.user._json;

      const user = await createOrFindUser(email, "google");
      const company = await createOrFindCompany(user);
      const isSetup = user.id !== company.owner || company.setupComplete;

      const token = jwt.sign(user, secrets.jwt ?? "", {
        expiresIn: 604800,
      });

      const wallets = await knex<UserWallet>(DBModels.USER_WALLETS).where({
        walletOwner: user.id,
      });

      res.send({
        googleAuth: true,
        token,
        email,
        picture,
        setup: isSetup,
        wallets,
      });
    } catch (err) {
      console.log(err);
      console.log("/auth/google: failed here");
    }
  }
);

const checkAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }

  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (!user) res.send({ isAuthenticated: false });
    else {
      req.user = user;
      next();
    }
  })(req, res);
};

router.get("/ping", checkAuthenticated, async (req, res) => {
  if (req.user) {
    const knex = await getKnexClient();
    const user = req.user as User;
    const companyName = getCompanyName(user.email);
    const company = await knex<Company>("company")
      .where({ companyName })
      .first();

    res.send({
      isAuthenticated: true,
      isSetup: company?.setupComplete ?? false,
    });
  } else {
    res.send({ isAuthenticated: false });
  }
});

export default router;

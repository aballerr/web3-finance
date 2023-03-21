// @ts-nocheck - I can't find a lot of the types needed... so I just disabled typescript
import nodemailer from "nodemailer";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import passport from "passport";
import getKnexClient, { DBModels } from "../db/knex";
import getSecret, { StoreSecrets } from "../secrets";
import { createOrFindUser } from "../db/user";

const GOOGLE_REDIRECT_URI = "https://developers.google.com/oauthplayground"; // The OAuth2 server (playground)
const GOOGLE_CLIENT_EMAIL = "alex@getbase58.com";

let accesstokenTime = new Date();
let accessToken = undefined;

const getOAuth2Client = async () => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } =
    await getSecret(StoreSecrets.GOOGLE);

  const OAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  OAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

  return OAuth2Client;
};

// guide to get refresh token: https://medium.com/geekculture/how-do-i-get-an-oauth-credential-35d6d0e5d617

const getAccessToken = async () => {
  const diff = new Date() - accesstokenTime;
  const minutes = diff / 1000 / 60;

  const OAuth2Client = await getOAuth2Client();

  if (minutes > 55 || accessToken === undefined) {
    accessToken = await OAuth2Client.getAccessToken();
  }

  return accessToken;
};

const BASE_STRING =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPRSTUVWXYZ";

const generateMultifactorAuthenticationCode = () => {
  let token = "";

  for (let i = 0; i < 7; i++) {
    const randomNumber = Math.floor(Math.random() * BASE_STRING.length);
    token += BASE_STRING[randomNumber];
  }

  return token;
};

// https://levelup.gitconnected.com/nodemailer-with-gmail-not-working-4ed254258ac
export const sendEmail = async (email: string) => {
  try {
    await getAccessToken();

    const multifactorAuthenticationCode =
      generateMultifactorAuthenticationCode();
    const knex = await getKnexClient();
    const user = await createOrFindUser(email, "manual");

    if (user.type === "google")
      return { success: false, error: "GOOGLE_ACCOUNT" };

    await knex(DBModels.AUTH_CODES).insert({
      email,
      code: multifactorAuthenticationCode,
    });

    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } =
      await getSecret(StoreSecrets.GOOGLE);

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: GOOGLE_CLIENT_EMAIL,
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        refreshToken: GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: `GETBASE58 <${GOOGLE_CLIENT_EMAIL}>`,
      to: email,
      subject: `GetBase58 Auth Code`,
      html: `Your auth code is: <b>${multifactorAuthenticationCode}</b>`,
    };

    // Set up the email options and delivering it
    const result = await transport.sendMail(mailOptions);

    return { success: true };
  } catch (err) {
    console.log(err);
    console.log("send email failed");
    return { success: false };
  }
};

export const verifyCode = async ({
  email,
  code,
}: {
  email: string;
  code: string;
}) => {
  const knex = await getKnexClient();

  const savedCode = await knex("authCodes")
    .where({ email })
    .whereRaw(`"createdAt" > NOW() - INTERVAL '5 minutes'`)
    .orderBy("createdAt", "desc")
    .first();

  const { code: existingCode } = savedCode;

  if (
    code === undefined ||
    typeof code !== "string" ||
    code.length !== 7 ||
    code !== existingCode
  ) {
    return { success: false };
  }

  const secrets = await getSecret(StoreSecrets.JWT);
  const user = await createOrFindUser(email);

  const token = jwt.sign(user, secrets.jwt ?? "", {
    expiresIn: 604800,
  });

  return {
    success: true,
    token,
    user,
  };
};

export const verifyGoogleUser = async (email: string) => {
  const user = await createOrFindUser(email, "google");
  const secrets = await getSecret(StoreSecrets.JWT);

  const token = jwt.sign(user, secrets.jwt ?? "", {
    expiresIn: 604800,
  });

  return Promise.resolve({
    success: true,
    token: "JWT " + token,
  });
};

export const checkAuthenticated = (
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

import { Request } from "express";
import passport, { PassportStatic } from "passport";
import gstrategy, { Profile } from "passport-google-oauth20";
import JWT from "passport-jwt";
import knex from "knex";
import AWS from "aws-sdk";

import getSecret, { StoreSecrets } from "../src/services/secrets";

const GoogleStrategy = gstrategy.Strategy;

const { devmode } = process.env;

const awsClient = new AWS.SecretsManager({
  region: "us-east-1",
});

// I know this is a duplicate, do not remove or edit ever
// google auth is weird
const getSecrets = async () => {
  return new Promise((res, rej) => {
    awsClient.getSecretValue(
      { SecretId: StoreSecrets.POSTGRES },
      function (err, data) {
        if (err) {
        } else {
          // Decrypts secret using the associated KMS key.
          // Depending on whether the secret is a string or binary, one of these fields will be populated.
          if (data?.SecretString) {
            // res(JSON.parse(data.SecretString));

            return res(JSON.parse(data.SecretString));
          } else {
            // @ts-ignore
            const buff = new Buffer(data.SecretBinary, "base64");
            const decodedBinarySecret = buff.toString("ascii");
          }
        }
      }
    );
  });
};

const authUser = async (
  request: Request,
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: Function
) => {
  // @ts-ignore
  let client;

  const { emails, name, photos } = profile;
  const email = emails?.length ? emails[0].value : "";
  const fullName = `${name?.givenName} ${name?.familyName}`;
  const profile_picture = photos?.length ? photos[0].value : "";

  if (devmode) {
    const {
      host,
      user = "docker",
      password = "docker",
      database = "docker",
    } = process.env;
    client = knex({
      client: "pg",
      connection: {
        host: host,
        port: 5432,
        user: user,
        password: password,
        database: database,
      },
    });
  } else {
    //@ts-ignore
    const { host, username, password } = await getSecrets();

    client = knex({
      client: "pg",
      connection: {
        host: host,
        port: 5432,
        user: username,
        password: password,
        database: "postgres",
      },
    });
  }

  try {
    const userExists = await client("users").where({ email });

    if (userExists.length === 0) {
      await client("users").insert({
        email,
        type: "gmail",
        name: fullName,
        profile_picture,
      });
    }

    done(null, profile);
  } catch (error) {
    done(null, profile);
  }
};

const configurePassport = async (passport: PassportStatic) => {
  // @ts-ignore
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = await getSecret(
    StoreSecrets.GOOGLE
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID ?? "",
        clientSecret: GOOGLE_CLIENT_SECRET ?? "",
        callbackURL: devmode
          ? "http://localhost:3000/auth/google/callback"
          : "https://api.getbase58.com/auth/google/callback",
        passReqToCallback: true,
      },
      authUser
    )
  );
};

// configurePassport(passport);

const opts = {
  jwtFromRequest: JWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "myrandomsecret",
};

passport.use(
  new JWT.Strategy(opts, function (jwt_payload, done) {
    done(null, jwt_payload);
  })
);

passport.serializeUser((user: Express.User, done: Function) => {
  done(null, user);
});

passport.deserializeUser((user: Express.User, done: Function) => {
  done(null, user);
});

export default passport;

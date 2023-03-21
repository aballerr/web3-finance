const passport = require("passport");
const GoogleTokenStrategy = require("passport-google-token").Strategy;
import knex from "knex";
import AWS from "aws-sdk";
import getSecret, { StoreSecrets } from "../secrets";

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

const createAuth = async () => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = await getSecret(
    StoreSecrets.GOOGLE
  );

  passport.use(
    new GoogleTokenStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
      },
      async (accessToken, refreshToken, profile, done) => {
        let client;

        const { email, name, picture } = profile._json;
        const companyName = email.split("@")[1].split(".")[0];

        const { devmode } = process.env;

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
          const { host, user, password } = await getSecrets();

          client = knex({
            client: "pg",
            connection: {
              host: host,
              port: 5432,
              user: user,
              password: password,
              database: "postgres",
            },
          });
        }

        try {
          const userExists = await client("users").where({ email }).first();
          const companyExists = await client("company")
            .where({ companyName })
            .first();

          if (userExists === undefined) {
            await client("users").insert({
              email,
              name,
              profilePicture: picture,
              type: "gmail",
            });
          }

          if (companyExists === undefined) {
            const user = await client("users").where({ email }).first();
            await client("company").insert({
              companyName,
              owner: user.id,
              setupComplete: false,
            });
          }

          done(null, profile);
        } catch (error) {
          console.log(error);
          console.log("failed...");

          done(null, profile);
        }
      }
    )
  );
};

createAuth();

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;

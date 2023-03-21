require("dotenv").config();
import express from "express";
import bodyParser from "body-parser";

import "./services/auth/google-token";
import corsMiddleware from "./middleware/cors";
import auth from "./routes/auth";
import user from "./routes/user";
import graphs from "./routes/graphs";
import filters from "./routes/filters";
import gnosisSafe from "./routes/gnosis-safe";
import transactions from "./routes/transactions";
import passportMiddleware from "./middleware/passport";
import { checkAuthenticated } from "./services/auth/multiFactorAuth";
import { updateAllUserSafes, updateSafeBalances } from "./services/gnosis";
import { addMessageToQueue, SQS_URLS } from "./services/sqs";
import { getPreloadedClient } from "./services/db/knex";

const { devmode } = process.env;

const app = express();

// app.use(
//   cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
// );
// old probably not needed

// middleware
app.use(passportMiddleware);
app.use(corsMiddleware);
app.use(bodyParser.json({ limit: "1mb" }));

// listen
app.listen(3000, () => {
  console.log("listening port 3000");
});

// routes
app.use("/auth", auth);
app.use("/user", checkAuthenticated, user);
app.use("/gnosis-safe", checkAuthenticated, gnosisSafe);
app.use("/filters", checkAuthenticated, filters);
app.use("/transactions", checkAuthenticated, transactions);
app.use("/graphs", checkAuthenticated, graphs);

app.get("/ping", async (req, res) => {
  try {
    res.send("hii from base58 new");
  } catch (err) {
    console.log(err);
    res.send("error");
  }
});

if (!devmode) {
  process.on("uncaughtException", function (error) {
    console.log(error.stack);
  });
}

(async () => {
  // if (devmode) {
  //   // setTimeout(() => {
  //   //
  //   // }, 300000);
  //   setTimeout(() => {
  //   }, 600000);
  // }
  // updateAllUserSafes();
  // updateSafeBalances(1);
  // const knex = await getPreloadedClient();
  // await knex.USERS().where({ id: 1 }).update({ name: "Alex Ball" });
})();

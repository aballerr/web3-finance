import express, { Request } from "express";
import session from "express-session";
import passport from "passport";
import JWT from "passport-jwt";

import getSecret, { StoreSecrets } from "../services/secrets";

const router = express.Router();

interface Secret {
  jwt: string;
}

const jwtStrat = async () => {
  const { jwt } = (await getSecret(StoreSecrets.JWT)) as Secret;

  const opts = {
    jwtFromRequest: JWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwt,
  };

  passport.use(
    new JWT.Strategy(opts, function (jwt_payload, done) {
      done(null, jwt_payload);
    })
  );
};

jwtStrat();

passport.serializeUser((user: Express.User, done: Function) => {
  done(null, user);
});

passport.deserializeUser((user: Express.User, done: Function) => {
  done(null, user);
});

router.use(
  session({
    secret: "szzzzadfasfecret",
    resave: false,
    saveUninitialized: true,
  })
);

router.use(passport.initialize());
router.use(passport.session());

export default router;

// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["email", "profile"] })
// );

// const prodRedirect = "https://app.getbase58.com";
// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     successRedirect: devmode ? "http://localhost:3001/" : prodRedirect,
//     failureRedirect: devmode
//       ? "http://localhost:3001/login"
//       : `${prodRedirect}/login`,
//   })
// );

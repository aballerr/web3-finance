import cors from "cors";
import express from "express";

const router = express.Router();

const whitelist = [
  "http://localhost:3001",
  "https://app.getbase58.com",
  "https://frontend-getbase58.vercel.app",
];
router.use(
  cors({
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin || "") !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

export default router;

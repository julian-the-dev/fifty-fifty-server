import { COMMON } from "./utils/common.const";
import { DbUtils } from "./utils/db.utils";
import cookieParser from "cookie-parser";
import express from "express";
import createError from "http-errors";
import logger from "morgan";
import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

async function main() {
  // initialize configuration
  dotenv.config();
  const app = init();
  DbUtils.connect(process.env.DATABASE);
  const port = process.env.AUTH_PORT;
  initRoutes(app);
  handleErrors(app);

  // start the Express server
  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
  });
}
main();

function init() {
  const app = express();
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, "public")));
  app.get("/", (req, res) => res.send("Express + TypeScript Server"));
  return app;
}

function initRoutes(app) {
  app.get("/signup", async (req, res) => {
    const password = req.body.password;
    const email = req.body.email;
    const username = req.body.username;
    const collUsers = DbUtils.getDB().collection("users");
    const userFound = await collUsers
      .find({ $or: [{ username }, { email }] })
      .toArray();
    if (userFound) {
      res.status(500);
      res.send("Error user found");
    } else {
      const hash = await bcrypt.hash(password, COMMON.saltRounds);
      collUsers.insertOne({ username, email, hash });
    }
  });
  app.get("/login", async (req, res) => {
    const password = req.body.password;
    const username = req.body.username;
    const collUsers = DbUtils.getDB().collection("users");
    const userFound = await collUsers.findOne({ username });
    if (userFound) {
      const passwordMatch = await bcrypt.compare(password, userFound.hash);
      if (passwordMatch) {
      } else {
        res.status(503);
        res.send("Password does not match!");
      }
    } else {
      res.status(500);
      res.send("Error user not found");
    }
  });
  app.get("/token", (req, res) => res.send("Express + TypeScript Server"));
  app.get("/logout", (req, res) => res.send("Express + TypeScript Server"));
}

function handleErrors(app) {
  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    //res.status(err.status || 500);
    //res.json("error");
  });
}

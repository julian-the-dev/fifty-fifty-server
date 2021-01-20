import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import logger from "morgan";
import path from "path";
import { COMMON } from "./utils/common.const";
import { CommonUtils } from "./utils/common.utils";
import { DbUtils } from "./utils/db.utils";

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
  return app;
}

function initRoutes(app) {
  app.use("/signup", cors(), async (req, res) => {
    console.log("signup received!", req.body);
    const password = req.body.password;
    const email = req.body.email;
    const username = req.body.username;
    const collUsers = DbUtils.getDB().collection("users");
    const usersFound = await collUsers
      .find({ $or: [{ username }, { email }] })
      .toArray();
    if (usersFound.length) {
      CommonUtils.send(res, 500, "Error user found");
    } else {
      const hash = await bcrypt.hash(password, COMMON.saltRounds);
      collUsers.insertOne({ username, email, hash });
      CommonUtils.send(res, 200, 'ok');
    }
  });

  app.use("/login", cors(), async (req, res) => {
    console.log('user params', req.body);
    const password = req.body.password;
    const username = req.body.username;
    const collUsers = DbUtils.getDB().collection("users");
    const userFound = await collUsers.findOne({ username });
    console.log("login with user", userFound);
    if (userFound) {
      const passwordMatch = await bcrypt.compare(password, userFound.hash);
      if (passwordMatch) {
        const accessToken = createToken(
          userFound,
          process.env.ACCESS_TOKEN_SECRET
        );
        const refreshToken = createToken(
          userFound,
          process.env.REFRESH_TOKEN_SECRET,
          "1y"
        );
        DbUtils.getDB()
          .collection("refresh_tokens")
          .insertOne({ refreshToken });
        res.json({ accessToken, refreshToken });
      } else {
        CommonUtils.send(res, 500, "Password does not match!");
      }
    } else {
      CommonUtils.send(res, 500, "Error user not found");
    }
  });

  app.use("/token", cors(), async (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      CommonUtils.send(res, 403, "no refresh token sent");
      return;
    }
    const itemFound = await DbUtils.getDB()
      .collection("refresh_tokens")
      .findOne({ refreshToken });
    if (!itemFound) {
      CommonUtils.send(res, 403, "error no refresh token found in db");
      return;
    }
    jwt.verify(
      itemFound.refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, user) => {
        console.log("err", err, "user", user);
        if (err) {
          CommonUtils.send(res, 403, "error in jwt verify");
          return;
        }
        const accessToken = createToken(
          {
            _id: user._id,
          },
          process.env.ACCESS_TOKEN_SECRET
        );
        CommonUtils.send(res, 200, { accessToken });
      }
    );
  });

  app.use("/logout", cors(), (req, res) => {
    const refreshToken = req.body.refreshToken;
    DbUtils.getDB().collection("refresh_tokens").deleteOne({ refreshToken });
    return res.status(200);
  });
}

function createToken(user, secret, expiresIn = "5m") {
  return jwt.sign({ _id: user._id }, secret, { expiresIn });
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

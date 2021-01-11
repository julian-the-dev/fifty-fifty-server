import { DbUtils } from './utils/db.utils';
import cookieParser from "cookie-parser";
import express from "express";
import createError from "http-errors";
import logger from "morgan";
import path from "path";
import apiRouter from "./api/v1/api";
import dotenv from "dotenv";

async function main() {
  // initialize configuration
  dotenv.config();
  const app = init();
  DbUtils.connect(process.env.DATABASE)
  const port = process.env.SERVER_PORT;
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
  app.use("/api/v1", apiRouter);
  return app;
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

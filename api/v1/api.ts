import cors from "cors";
import express from "express";
import authenticateToken from "../../middlewares/authenticateToken";
import { CommonUtils } from "../../utils/common.utils";
import { DbUtils } from "./../../utils/db.utils";

const router = express.Router();

/* GET users listing. */
router.use("/fifty-fifty/create", cors(), async function (req, res, next) {
  const fiftyFifty = req.body;
  DbUtils.getDB()
    .collection("fifty_fifties")
    .insertOne(fiftyFifty)
    .then((result) => {
      CommonUtils.send(200, result.insertedId);
    })
    .catch((err) => {
      CommonUtils.send(res, 500, "error while creating");
    });
});

router.use("/fifty-fifty/update", cors(), async function (req, res, next) {
  const fiftyFifty = req.body.fiftyFifty;
  DbUtils.getDB()
    .collection("fifty_fifties")
    .updateOne({ _id: fiftyFifty._id }, fiftyFifty)
    .then((result) => CommonUtils.send(res, 200, result))
    .catch((err) => {
      CommonUtils.send(res, 500, 'error while updating');
    });
});

router.use("/fifty-fifty/get/:id", cors(), async function (req, res, next) {
  const _id = req.params.id;
  const fiftyFifty = DbUtils.getDB()
    .collection("fifty_fifties")
    .findOne({ _id: _id });
  if (fiftyFifty) {
    CommonUtils.send(res, 200, fiftyFifty);
  } else {
    CommonUtils.send(res, 500, 'error while getting');
  }
});

/* GET users listing. */
router.use("/fifty-fifty/list", cors(), async function (req, res, next) {
  const list = await DbUtils.getDB()
    .collection("fifty_fifties")
    .find()
    .toArray();
    CommonUtils.send(res, 200, CommonUtils.convertIdArray(list));
});

export default router;

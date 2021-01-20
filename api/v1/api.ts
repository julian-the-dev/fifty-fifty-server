import mongodb from "mongodb";
import cors from "cors";
import express from "express";
import { CommonUtils } from "../../utils/common.utils";
import { DbUtils } from "./../../utils/db.utils";
import { authenticateTokenStrict } from "../../middlewares/authenticateToken";

const router = express.Router();

/* GET users listing. */
router.use(
  "/fifty-fifty/create",
  cors(),
  authenticateTokenStrict,
  async function (req, res, next) {
    const fiftyFifty = req.body;
    console.log("fiftyFifty received", fiftyFifty);
    DbUtils.getDB()
      .collection("fifty_fifties")
      .insertOne(fiftyFifty)
      .then((result) => {
        CommonUtils.send(res, 200, result.insertedId);
      })
      .catch((err) => {
        console.log("error", err);
        CommonUtils.send(res, 500, "error while creating");
      });
  }
);

router.use("/fifty-fifty/update", cors(), async function (req, res, next) {
  const fiftyFifty = req.body;
  const id = CommonUtils.getIdForMongo(fiftyFifty);
  console.log("fiftyFifty received", fiftyFifty);
  DbUtils.getDB()
    .collection("fifty_fifties")
    .replaceOne({ _id: new mongodb.ObjectId(id) }, fiftyFifty)
    .then((result) => CommonUtils.send(res, 200, result))
    .catch((err) => {
      console.log(err);
      CommonUtils.send(res, 500, "error while updating");
    });
});

router.use("/fifty-fifty/delete/:id", cors(), async function (req, res, next) {
  const id = req.params.id;
  DbUtils.getDB()
    .collection("fifty_fifties")
    .deleteOne({ _id: new mongodb.ObjectId(id) })
    .then((result) => CommonUtils.send(res, 200, result))
    .catch((err) => {
      console.log(err);
      CommonUtils.send(res, 500, "error while deleting");
    });
});

router.use("/fifty-fifty/get/:id", cors(), async function (req, res, next) {
  const _id = req.params.id;
  const fiftyFifty = DbUtils.getDB()
    .collection("fifty_fifties")
    .findOne({ _id: new mongodb.ObjectId(_id) });
  if (fiftyFifty) {
    CommonUtils.send(res, 200, fiftyFifty);
  } else {
    CommonUtils.send(res, 500, "error while getting");
  }
});

/* GET users listing. */
router.use("/fifty-fifty/list", cors(), async function (req, res, next) {
  const list = await DbUtils.getDB()
    .collection("fifty_fifties")
    .find()
    .toArray();
  CommonUtils.send(res, 200, CommonUtils.convertToIdArray(list));
});

/* GET users listing. */
router.use(
  "/user/light",
  [cors(), authenticateTokenStrict],
  async function (req: any, res, next) {
    const _id = req.user._id;
    const userFound = await DbUtils.getDB()
      .collection("users")
      .findOne({ _id: new mongodb.ObjectId(_id) });
    if (userFound) {
      const user = {
        id: userFound._id,
        username: userFound.username,
        avatar: userFound.avatar
      };
      CommonUtils.send(res, 200, user);
    } else {
      CommonUtils.send(res, 500, "No user found");
    }
  }
);

export default router;

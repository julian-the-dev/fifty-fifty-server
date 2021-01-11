import { DbUtils } from './../../utils/db.utils';
import express from "express";
const router = express.Router();

/* GET users listing. */
router.get("/", async function (req, res, next) {
  const users = await DbUtils.getDB().collection('users').find().toArray();
  res.json(users);
});

export default router;

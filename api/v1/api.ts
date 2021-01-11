import express from "express";
import authenticateToken from '../../middlewares/authenticateToken';
import { DbUtils } from './../../utils/db.utils';

const router = express.Router();

/* GET users listing. */
router.get("/", authenticateToken, async function (req, res, next) {
  const users = await DbUtils.getDB().collection('users').find().toArray();
  res.json(users);
});

export default router;

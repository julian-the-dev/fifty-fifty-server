import express from "express";
import mongodb from "mongodb";

const router = express.Router();
const mongodbClient = mongodb.MongoClient;
let dbUser;

mongodbClient.connect(
  "mongodb://localhost:27017",
  { useUnifiedTopology: true },
  (err, client) => {
    console.log("Connected successfully to server");
    // dbClient = client.db('users');
  }
);

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("Hello World 2!");
  const db= mongodb.Mongo().getDb('');
  
});

export default router;

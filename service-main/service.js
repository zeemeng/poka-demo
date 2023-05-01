import express from "express";
import { MongoClient } from "mongodb";

const app = express();

const host = process.env.MONGO_HOST ?? "localhost:27017";
const url = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${host}`;
const client = new MongoClient(url);

app.use("*", (req, res, next) => {
  console.log(req.path);
  next();
});

app.use(express.json());

app.get("/entries", async (req, res, next) => {
  await client.connect();
  const db = client.db("entries");
  const collection = db.collection("entries");
  const cursor = collection.find();
  const entries = await cursor.toArray();
  client.close();
  res.json({ entries });
});

app.post("/entries", async (req, res, next) => {
  await client.connect();
  const db = client.db("entries");
  const collection = db.collection("entries");
  const entry = req.body;
  try {
    const result = await collection.insertOne(entry);
    res.status(201).json({
      message: "Entry inserted successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    next(error);
  }
  client.close();
});

app.get("*", (req, res, next) => {
  res.sendFile("index.html", {
    root: ".",
  });
});

console.log(url);
app.listen(5000, () => console.log("service-main listening on port 5000"));

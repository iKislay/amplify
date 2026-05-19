import express from "express";
import cors from "cors";
import "dotenv/config";
import { handleEnhance } from "./routes/enhance.js";

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/enhance", handleEnhance);

app.listen(PORT, () => {
  console.log(`Amplify backend running on http://localhost:${PORT}`);
});
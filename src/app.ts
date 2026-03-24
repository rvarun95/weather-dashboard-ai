import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import weatherRouter from "./routes/weather";
import widgetsRouter from "./routes/widgets";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "weather-dashboard-backend" });
});

app.use("/api/weather", weatherRouter);
app.use("/api/widgets", widgetsRouter);

const PORT = process.env.PORT ?? 3001;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${PORT}`);
});


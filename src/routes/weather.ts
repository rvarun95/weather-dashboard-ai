import { Router } from "express";
import {
  getWeatherForCity,
  getWeatherSummaryForCity
} from "../controllers/weatherController";

const router = Router();

// More specific routes first
router.get("/:city/summary", getWeatherSummaryForCity);
router.get("/:city", getWeatherForCity);

export default router;


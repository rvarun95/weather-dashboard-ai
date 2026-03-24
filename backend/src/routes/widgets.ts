import { Router } from "express";

const router = Router();

// Placeholder CRUD routes for future widget persistence
router.get("/", (_req, res) => {
  res.json({ widgets: [] });
});

export default router;


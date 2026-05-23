import express from "express";
import { getAnomalies, getAnomalyStats } from "../controllers/anomaly.controller";

const router = express.Router();

router.get("/", getAnomalies);
router.get("/stats", getAnomalyStats);

export default router;
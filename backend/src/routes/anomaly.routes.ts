import express from "express";
import { getAnomalies } from "../controllers/anomaly.controller";

const router = express.Router();

router.get("/", getAnomalies);

export default router;
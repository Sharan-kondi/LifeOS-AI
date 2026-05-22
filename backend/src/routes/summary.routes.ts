import express from "express";
import { getSummary } from "../controllers/summary.controller";

const router = express.Router();

router.get("/", getSummary);

export default router;
import express from "express";
import { getProductivity } from "../controllers/productivity.controller";

const router = express.Router();

router.get("/", getProductivity);

export default router;
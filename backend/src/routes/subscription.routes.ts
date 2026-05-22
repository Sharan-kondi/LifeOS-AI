import express from "express";
import { getSubscriptions } from "../controllers/subscription.controller";

const router = express.Router();

router.get("/", getSubscriptions);

export default router;
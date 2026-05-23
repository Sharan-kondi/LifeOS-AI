import express from "express";
import {
  getTransactions,
  getTransactionsByCategory,
  getSpendingTrend,
  getTopMerchants,
} from "../controllers/transaction.controller";

const router = express.Router();

router.get("/", getTransactions);
router.get("/by-category", getTransactionsByCategory);
router.get("/trend", getSpendingTrend);
router.get("/top-merchants", getTopMerchants);

export default router;
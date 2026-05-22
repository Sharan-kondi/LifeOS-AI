import express from "express";
import cors from "cors";

import transactionRoutes from "./routes/transaction.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import productivityRoutes from "./routes/productivity.routes";
import anomalyRoutes from "./routes/anomaly.routes";
import summaryRoutes from "./routes/summary.routes";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/transactions", transactionRoutes);

app.use("/subscriptions", subscriptionRoutes);

app.use("/productivity", productivityRoutes);

app.use("/anomalies", anomalyRoutes);

app.use("/summary", summaryRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
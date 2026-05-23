"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTransactions } from "@/services/data";
import type { Transaction, TransactionsResponse } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  Food: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Transport: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Shopping: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Bills: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Entertainment: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Investment: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Health: "bg-red-500/10 text-red-400 border-red-500/20",
  Education: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Travel: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  ATM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Groceries: "bg-lime-500/10 text-lime-400 border-lime-500/20",
};

export default function TransactionsPage() {
  const [data, setData] = useState<TransactionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchTransactions();
  }, [selectedCategory, sortOrder]);

  async function fetchTransactions() {
    try {
      setLoading(true);
      const result = await getTransactions({
        limit: 100,
        category: selectedCategory || undefined,
        search: search || undefined,
        sortBy: "timestamp",
        sortOrder,
      });
      setData(result);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = () => {
    fetchTransactions();
  };

  const categories = Object.keys(CATEGORY_COLORS);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          {data?.total?.toLocaleString("en-IN") || 0} total transactions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search merchant or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-9 w-full rounded-lg border border-input bg-secondary/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-colors"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          className="gap-2"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortOrder === "desc" ? "Newest First" : "Oldest First"}
        </Button>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            !selectedCategory
              ? "border-violet-500/50 bg-violet-500/10 text-violet-400"
              : "border-border text-muted-foreground hover:bg-secondary"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? "border-violet-500/50 bg-violet-500/10 text-violet-400"
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Merchant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.data || []).map((tx, i) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-border/50 transition-colors hover:bg-secondary/30"
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        {tx.merchant}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            CATEGORY_COLORS[tx.category] || "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold tabular-nums">
                        ₹{tx.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {tx.paymentMethod}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {tx.location}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

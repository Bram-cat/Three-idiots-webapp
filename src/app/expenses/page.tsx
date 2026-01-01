"use client";

import { useState, useEffect } from "react";
import { Expense, getExpenses } from "@/lib/store";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [isLoading, setIsLoading] = useState(true);

  const loadExpenses = async () => {
    const data = await getExpenses();
    setExpenses(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const filteredExpenses = expenses.filter((e) => {
    if (filter === "all") return true;
    return e.status === filter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Expenses</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className={
            showForm
              ? "bg-zinc-800 text-white hover:bg-zinc-700"
              : "bg-cyan-500 text-black hover:bg-cyan-400"
          }
        >
          {showForm ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </>
          )}
        </Button>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <ExpenseForm
          onExpenseAdded={() => {
            loadExpenses();
            setShowForm(false);
          }}
        />
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === f
                ? "bg-cyan-500 text-black"
                : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800"
            }`}
          >
            {f}
            {f === "pending" && expenses.filter((e) => e.status === "pending").length > 0 && (
              <span className="ml-2 bg-zinc-800 text-cyan-400 text-xs px-1.5 py-0.5 rounded-full">
                {expenses.filter((e) => e.status === "pending").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Expense List */}
      <ExpenseList expenses={filteredExpenses} onUpdate={loadExpenses} />
    </div>
  );
}

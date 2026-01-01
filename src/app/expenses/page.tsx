"use client";

import { useState, useEffect } from "react";
import { Expense, getExpenses } from "@/lib/store";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";

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
        <div className="w-12 h-12 border-4 border-[#00a7e1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#00171f]">Expenses</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showForm
              ? "bg-gray-200 text-[#003459]"
              : "bg-[#00a7e1] text-white hover:bg-[#007ea7]"
          }`}
        >
          {showForm ? "Cancel" : "+ Add Expense"}
        </button>
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f
                ? "bg-[#00a7e1] text-white"
                : "bg-white text-[#003459] hover:bg-[#00a7e1]/10 border border-[#007ea7]/20"
            }`}
          >
            {f}
            {f === "pending" && (
              <span className="ml-1 bg-[#003459] text-white text-xs px-1.5 py-0.5 rounded-full">
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

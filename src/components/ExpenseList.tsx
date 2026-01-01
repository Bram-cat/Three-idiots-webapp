"use client";

import { useState, useEffect } from "react";
import { Expense, User, approveExpense, getUsers, roommateConfig } from "@/lib/store";
import { useCurrentUser } from "@/context/UserContext";

interface ExpenseListProps {
  expenses: Expense[];
  onUpdate: () => void;
}

export default function ExpenseList({ expenses, onUpdate }: ExpenseListProps) {
  const { oderId } = useCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const handleApprove = async (expenseId: string) => {
    if (!oderId) return;
    setApprovingId(expenseId);
    await approveExpense(expenseId, oderId);
    setApprovingId(null);
    onUpdate();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUser = (oderId: string) => users.find((u) => u.id === oderId);

  const getUserDisplay = (oderId: string) => {
    const user = getUser(oderId);
    if (user) {
      return {
        name: user.name,
        avatar: user.avatar,
        color: user.color,
      };
    }
    return {
      name: "Unknown",
      avatar: "👤",
      color: "bg-gray-400",
    };
  };

  const getStatusBadge = (expense: Expense) => {
    if (expense.status === "approved") {
      return (
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
          Approved
        </span>
      );
    }
    if (expense.status === "rejected") {
      return (
        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
          Rejected
        </span>
      );
    }
    return (
      <span className="bg-[#00a7e1]/20 text-[#003459] text-xs px-2 py-1 rounded-full">
        {expense.approvals.length}/3 Approvals
      </span>
    );
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-[#007ea7] border border-[#007ea7]/10">
        <span className="text-4xl">📝</span>
        <p className="mt-2">No expenses yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => {
        const paidByDisplay = getUserDisplay(expense.paidBy);
        const hasApproved = expense.approvals.includes(oderId || "");
        const isOwnExpense = expense.paidBy === oderId;
        const canApprove =
          !isOwnExpense && !hasApproved && expense.status === "pending";

        return (
          <div
            key={expense.id}
            className="bg-white rounded-xl shadow-sm p-4 space-y-3 border border-[#007ea7]/10"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-[#00171f]">
                  {expense.description}
                </h3>
                <p className="text-sm text-[#007ea7]">
                  {expense.category} • {formatDate(expense.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[#00171f]">
                  ${expense.amount.toFixed(2)}
                </p>
                {getStatusBadge(expense)}
              </div>
            </div>

            {/* Receipt Preview */}
            {expense.receiptImage && (
              <div className="bg-gray-50 rounded-lg p-2">
                <img
                  src={expense.receiptImage}
                  alt="Receipt"
                  className="max-h-24 mx-auto rounded cursor-pointer hover:opacity-80"
                  onClick={() => window.open(expense.receiptImage, "_blank")}
                />
              </div>
            )}

            {/* Paid By & Approvals */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#007ea7]">Paid by:</span>
                <span
                  className={`${paidByDisplay.color} text-white px-2 py-1 rounded-full text-xs`}
                >
                  {paidByDisplay.avatar} {paidByDisplay.name}
                </span>
              </div>

              {/* Approval avatars */}
              <div className="flex items-center gap-1">
                {expense.approvals.map((oderId) => {
                  const display = getUserDisplay(oderId);
                  return (
                    <span
                      key={oderId}
                      className={`${display.color} w-6 h-6 rounded-full flex items-center justify-center text-xs`}
                      title={`Approved by ${display.name}`}
                    >
                      {display.avatar}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Approve Button */}
            {canApprove && (
              <button
                onClick={() => handleApprove(expense.id)}
                disabled={approvingId === expense.id}
                className="w-full bg-[#00a7e1] text-white py-2 rounded-lg font-medium hover:bg-[#007ea7] transition-colors disabled:opacity-50"
              >
                {approvingId === expense.id ? "Approving..." : "Approve"}
              </button>
            )}

            {hasApproved && expense.status === "pending" && (
              <p className="text-center text-sm text-green-600">
                You approved this
              </p>
            )}

            {isOwnExpense && expense.status === "pending" && (
              <p className="text-center text-sm text-[#007ea7]">
                Waiting for roommates to approve...
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

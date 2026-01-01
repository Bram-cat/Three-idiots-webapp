"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Expense, User, approveExpense, getUsers, roommateConfig } from "@/lib/store";
import { useCurrentUser } from "@/context/UserContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, FileText } from "lucide-react";

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
      const config = roommateConfig[user.name];
      return {
        name: user.name,
        image: config?.image || "/images/default.png",
      };
    }
    return {
      name: "Unknown",
      image: "/images/default.png",
    };
  };

  const getStatusBadge = (expense: Expense) => {
    if (expense.status === "approved") {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          Approved
        </Badge>
      );
    }
    if (expense.status === "rejected") {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          Rejected
        </Badge>
      );
    }
    return (
      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
        {expense.approvals.length}/3 Approvals
      </Badge>
    );
  };

  if (expenses.length === 0) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
          <p className="text-zinc-500">No expenses yet</p>
        </CardContent>
      </Card>
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
          <Card key={expense.id} className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">
                    {expense.description}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {expense.category} &bull; {formatDate(expense.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">
                    ${expense.amount.toFixed(2)}
                  </p>
                  {getStatusBadge(expense)}
                </div>
              </div>

              {/* Receipt Preview */}
              {expense.receiptImage && (
                <div className="bg-zinc-800/50 rounded-lg p-2">
                  <img
                    src={expense.receiptImage}
                    alt="Receipt"
                    className="max-h-24 mx-auto rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(expense.receiptImage, "_blank")}
                  />
                </div>
              )}

              {/* Paid By & Approvals */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-500">Paid by:</span>
                  <div className="flex items-center gap-2 bg-zinc-800 px-2 py-1 rounded-full">
                    <div className="relative w-5 h-5 rounded-full overflow-hidden">
                      <Image
                        src={paidByDisplay.image}
                        alt={paidByDisplay.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs font-medium text-white">
                      {paidByDisplay.name}
                    </span>
                  </div>
                </div>

                {/* Approval avatars */}
                <div className="flex items-center gap-1">
                  {expense.approvals.map((approverId) => {
                    const display = getUserDisplay(approverId);
                    return (
                      <div
                        key={approverId}
                        className="relative w-6 h-6 rounded-full overflow-hidden ring-2 ring-green-500/50"
                        title={`Approved by ${display.name}`}
                      >
                        <Image
                          src={display.image}
                          alt={display.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Approve Button */}
              {canApprove && (
                <Button
                  onClick={() => handleApprove(expense.id)}
                  disabled={approvingId === expense.id}
                  className="w-full bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50"
                >
                  {approvingId === expense.id ? "Approving..." : "Approve"}
                </Button>
              )}

              {hasApproved && expense.status === "pending" && (
                <p className="text-center text-sm text-green-400">
                  You approved this
                </p>
              )}

              {isOwnExpense && expense.status === "pending" && (
                <p className="text-center text-sm text-zinc-500">
                  Waiting for roommates to approve...
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

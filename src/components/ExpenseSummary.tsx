"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Expense, User, getUsers, roommateConfig } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, DollarSign } from "lucide-react";

interface ExpenseSummaryProps {
  expenses: Expense[];
}

interface UserBalance {
  userId: string;
  name: string;
  image: string;
  paid: number;
  owes: number;
  balance: number; // positive = gets money back, negative = owes money
}

export default function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUsers().then((data) => {
      setUsers(data);
      setIsLoading(false);
    });
  }, []);

  // Only count approved expenses
  const approvedExpenses = expenses.filter((e) => e.status === "approved");
  const totalApproved = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const perPersonShare = totalApproved / 4; // Split equally among 4 roommates

  // Calculate balances for each user
  const calculateBalances = (): UserBalance[] => {
    const roommates = ["Ram", "Munna", "Suriya", "Kaushik"];

    return roommates.map((name) => {
      const user = users.find((u) => u.name === name);
      const config = roommateConfig[name];

      // Calculate how much this user paid (for approved expenses only)
      const paid = approvedExpenses
        .filter((e) => {
          const payer = users.find((u) => u.id === e.paidBy);
          return payer?.name === name;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      // Each person owes their share of the total
      const owes = perPersonShare;

      // Balance = what they paid - what they owe
      // Positive means they get money back, negative means they owe
      const balance = paid - owes;

      return {
        userId: user?.id || name,
        name,
        image: config?.image || "/images/default.png",
        paid,
        owes,
        balance,
      };
    });
  };

  const balances = calculateBalances();

  if (isLoading) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-24">
            <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 border-zinc-800">
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-cyan-400" />
            Expense Split
          </h2>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Total Approved</p>
            <p className="text-lg font-bold text-cyan-400">${totalApproved.toFixed(2)}</p>
          </div>
        </div>

        {/* Per person share info */}
        {approvedExpenses.length > 0 && (
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 text-center">
            <p className="text-sm text-zinc-400">Each person&apos;s share</p>
            <p className="text-2xl font-bold text-white">${perPersonShare.toFixed(2)}</p>
          </div>
        )}

        {/* No approved expenses message */}
        {approvedExpenses.length === 0 && (
          <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
            <p className="text-zinc-500 text-sm">
              No approved expenses yet. Expenses need 3 approvals to be counted in the split.
            </p>
          </div>
        )}

        {/* Balance breakdown per user */}
        {approvedExpenses.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-400">Balance Summary</h3>
            <div className="grid gap-3">
              {balances.map((userBalance) => (
                <div
                  key={userBalance.userId}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    userBalance.balance > 0
                      ? "bg-green-500/5 border-green-500/20"
                      : userBalance.balance < 0
                      ? "bg-red-500/5 border-red-500/20"
                      : "bg-zinc-800/50 border-zinc-700/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-zinc-700">
                      <Image
                        src={userBalance.image}
                        alt={userBalance.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{userBalance.name}</p>
                      <p className="text-xs text-zinc-500">
                        Paid: ${userBalance.paid.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {userBalance.balance > 0 ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <div className="text-right">
                          <p className="text-green-400 font-bold">
                            +${userBalance.balance.toFixed(2)}
                          </p>
                          <p className="text-xs text-green-400/70">gets back</p>
                        </div>
                      </>
                    ) : userBalance.balance < 0 ? (
                      <>
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        <div className="text-right">
                          <p className="text-red-400 font-bold">
                            -${Math.abs(userBalance.balance).toFixed(2)}
                          </p>
                          <p className="text-xs text-red-400/70">owes</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Minus className="w-4 h-4 text-zinc-400" />
                        <div className="text-right">
                          <p className="text-zinc-400 font-bold">$0.00</p>
                          <p className="text-xs text-zinc-500">settled</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending expenses notice */}
        {expenses.filter((e) => e.status === "pending").length > 0 && (
          <p className="text-xs text-zinc-500 text-center pt-2 border-t border-zinc-800">
            {expenses.filter((e) => e.status === "pending").length} pending expense(s) not included in split
          </p>
        )}
      </CardContent>
    </Card>
  );
}

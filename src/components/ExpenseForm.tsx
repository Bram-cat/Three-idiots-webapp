"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { addExpense } from "@/lib/store";
import { useCurrentUser } from "@/context/UserContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, X } from "lucide-react";

interface ExpenseFormProps {
  onExpenseAdded: () => void;
}

const categories = [
  "Groceries",
  "Utilities",
  "Rent",
  "Internet",
  "Cleaning",
  "Food Delivery",
  "Entertainment",
  "Other",
];

export default function ExpenseForm({ onExpenseAdded }: ExpenseFormProps) {
  const { oderId, userName, userImage } = useCurrentUser();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [receiptImage, setReceiptImage] = useState<string | undefined>();
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setReceiptImage(base64);

      setTimeout(() => {
        if (!description) {
          setDescription("Scanned Receipt");
        }
        setIsScanning(false);
      }, 1500);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !oderId) return;

    setIsSubmitting(true);
    await addExpense({
      description,
      amount: parseFloat(amount),
      category,
      paidBy: oderId,
      receiptImage,
    });

    setDescription("");
    setAmount("");
    setCategory(categories[0]);
    setReceiptImage(undefined);
    setIsSubmitting(false);
    onExpenseAdded();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Add New Expense</h2>

          {/* Receipt Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-400">
              Receipt (Optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center hover:border-cyan-500/50 transition-colors bg-zinc-900/50"
            >
              {isScanning ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-zinc-400">Scanning receipt...</span>
                </div>
              ) : receiptImage ? (
                <div className="space-y-2 relative">
                  <img
                    src={receiptImage}
                    alt="Receipt"
                    className="max-h-32 mx-auto rounded-lg"
                  />
                  <p className="text-sm text-green-400">Receipt uploaded</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReceiptImage(undefined);
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <Camera className="w-10 h-10 mx-auto text-zinc-600" />
                  <p className="text-zinc-500 mt-2">Tap to scan receipt</p>
                </div>
              )}
            </button>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-400">
              Description
            </label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this expense for?"
              className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-cyan-500 focus:ring-cyan-500"
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-400">
              Amount ($)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-cyan-500 focus:ring-cyan-500"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-400">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-zinc-900">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Paid By */}
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <span>Paid by:</span>
            <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-full">
              <div className="relative w-5 h-5 rounded-full overflow-hidden">
                <Image
                  src={userImage}
                  alt={userName || "User"}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-sm font-medium text-white">{userName}</span>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit for Approval"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

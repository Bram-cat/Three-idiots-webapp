"use client";

import { useState, useRef } from "react";
import { addExpense } from "@/lib/store";
import { useCurrentUser } from "@/context/UserContext";

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
  const { oderId, userName, userColor, userAvatar } = useCurrentUser();
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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4 border border-[#007ea7]/10">
      <h2 className="text-lg font-semibold text-[#00171f]">Add New Expense</h2>

      {/* Receipt Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#003459]">
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
          className="w-full border-2 border-dashed border-[#007ea7]/30 rounded-lg p-4 text-center hover:border-[#00a7e1] transition-colors"
        >
          {isScanning ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-[#00a7e1] border-t-transparent rounded-full animate-spin" />
              <span className="text-[#007ea7]">Scanning receipt...</span>
            </div>
          ) : receiptImage ? (
            <div className="space-y-2">
              <img
                src={receiptImage}
                alt="Receipt"
                className="max-h-32 mx-auto rounded"
              />
              <p className="text-sm text-green-600">Receipt uploaded</p>
            </div>
          ) : (
            <div>
              <span className="text-3xl">📷</span>
              <p className="text-[#007ea7] mt-1">Tap to scan receipt</p>
            </div>
          )}
        </button>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#003459]">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What was this expense for?"
          className="w-full px-4 py-2 border border-[#007ea7]/30 rounded-lg focus:ring-2 focus:ring-[#00a7e1] focus:border-transparent outline-none"
          required
        />
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#003459]">
          Amount ($)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full px-4 py-2 border border-[#007ea7]/30 rounded-lg focus:ring-2 focus:ring-[#00a7e1] focus:border-transparent outline-none"
          required
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#003459]">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 border border-[#007ea7]/30 rounded-lg focus:ring-2 focus:ring-[#00a7e1] focus:border-transparent outline-none"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Paid By */}
      <div className="flex items-center gap-2 text-sm text-[#007ea7]">
        <span>Paid by:</span>
        <span className={`${userColor} text-white px-2 py-1 rounded-full text-xs`}>
          {userAvatar} {userName}
        </span>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#00a7e1] text-white py-3 rounded-lg font-semibold hover:bg-[#007ea7] transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit for Approval"}
      </button>
    </form>
  );
}

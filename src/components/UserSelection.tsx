"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

type RoommateName = "Ram" | "Munna" | "Suriya" | "Kaushik";

interface SecurityQuestion {
  question: string;
  answer: string;
}

const securityQuestions: Record<RoommateName, SecurityQuestion> = {
  Ram: {
    question: "What is your favorite meme?",
    answer: "67",
  },
  Munna: {
    question: 'What is "golgappa" or "phuchka" in english? Type the answer with no spaces.',
    answer: "panipuri",
  },
  Suriya: {
    question: "What is ചായ in english?",
    answer: "tea",
  },
  Kaushik: {
    question: 'What is the first name of the lead actor of the movie "Hey Ram!"? (It is a single word starts with \'K\')',
    answer: "kamal",
  },
};

const roommateColors: Record<RoommateName, string> = {
  Ram: "bg-[#00a7e1]",
  Munna: "bg-[#007ea7]",
  Suriya: "bg-[#003459]",
  Kaushik: "bg-[#00171f]",
};

interface UserSelectionProps {
  onComplete: (name: RoommateName) => void;
}

export default function UserSelection({ onComplete }: UserSelectionProps) {
  const { user } = useUser();
  const [selectedUser, setSelectedUser] = useState<RoommateName | null>(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUserSelect = (name: RoommateName) => {
    setSelectedUser(name);
    setAnswer("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !user) return;

    const correctAnswer = securityQuestions[selectedUser].answer;

    if (answer.toLowerCase().trim() !== correctAnswer.toLowerCase()) {
      setError("Incorrect answer. Please try again.");
      setAnswer("");
      return;
    }

    setIsLoading(true);
    try {
      // Save to Supabase
      const { error: dbError } = await supabase
        .from("users")
        .insert({
          clerk_id: user.id,
          roommate_name: selectedUser,
        });

      if (dbError) {
        console.error("Database error:", dbError);
        setError("Failed to save. Please try again.");
        setIsLoading(false);
        return;
      }

      onComplete(selectedUser);
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00171f] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <h1 className="text-2xl font-bold text-[#00171f] text-center mb-2">
          Welcome to Three Idiots
        </h1>
        <p className="text-[#007ea7] text-center mb-8">
          Select your identity to continue
        </p>

        {!selectedUser ? (
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(securityQuestions) as RoommateName[]).map((name) => (
              <button
                key={name}
                onClick={() => handleUserSelect(name)}
                className={`${roommateColors[name]} text-white py-6 px-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg`}
              >
                {name}
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <div
                className={`${roommateColors[selectedUser]} text-white py-3 px-6 rounded-xl font-semibold text-xl inline-block mb-4`}
              >
                {selectedUser}
              </div>
            </div>

            <div className="bg-[#f0f9ff] border border-[#00a7e1] rounded-xl p-4">
              <p className="text-[#003459] font-medium mb-2">Security Question:</p>
              <p
                className="text-[#00171f] no-select"
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
              >
                {securityQuestions[selectedUser].question}
              </p>
            </div>

            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your answer..."
              className="w-full px-4 py-3 border-2 border-[#007ea7] rounded-xl focus:ring-2 focus:ring-[#00a7e1] focus:border-transparent outline-none"
              autoComplete="off"
            />

            {error && (
              <p className="text-red-500 text-center font-medium">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="flex-1 px-4 py-3 border-2 border-[#007ea7] text-[#007ea7] rounded-xl font-medium hover:bg-[#f0f9ff] transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !answer.trim()}
                className="flex-1 px-4 py-3 bg-[#00a7e1] text-white rounded-xl font-medium hover:bg-[#007ea7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { getTakenNames, roommateConfig } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

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

interface UserSelectionProps {
  onComplete: () => void;
}

export default function UserSelection({ onComplete }: UserSelectionProps) {
  const { user } = useUser();
  const [selectedUser, setSelectedUser] = useState<RoommateName | null>(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [takenNames, setTakenNames] = useState<string[]>([]);
  const [loadingNames, setLoadingNames] = useState(true);

  useEffect(() => {
    async function loadTakenNames() {
      const names = await getTakenNames();
      setTakenNames(names);
      setLoadingNames(false);
    }
    loadTakenNames();
  }, []);

  const availableNames = (Object.keys(securityQuestions) as RoommateName[]).filter(
    (name) => !takenNames.includes(name)
  );

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

      onComplete();
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  if (loadingNames) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // All names are taken
  if (availableNames.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-6">🚫</div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Oopsies!
            </h1>
            <p className="text-zinc-400 text-lg">
              Seems like you are not part of the group.
            </p>
            <p className="text-zinc-500 mt-4 text-sm">
              Please politely Fuck off
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
        <CardContent className="p-8">
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Three Idiots
          </h1>
          <p className="text-zinc-400 text-center mb-8">
            Select your identity to continue
          </p>

          {!selectedUser ? (
            <div className="grid grid-cols-2 gap-4">
              {availableNames.map((name) => {
                const config = roommateConfig[name];
                return (
                  <button
                    key={name}
                    onClick={() => handleUserSelect(name)}
                    className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-cyan-500/50 hover:bg-zinc-800/50"
                  >
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="relative w-20 h-20 mb-3 rounded-full overflow-hidden ring-2 ring-zinc-700 group-hover:ring-cyan-500 transition-all">
                        <Image
                          src={config.image}
                          alt={name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-lg font-semibold text-white">{name}</span>
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-cyan-500">
                  <Image
                    src={roommateConfig[selectedUser].image}
                    alt={selectedUser}
                    fill
                    className="object-cover"
                  />
                </div>
                <h2 className="text-xl font-semibold text-white">{selectedUser}</h2>
              </div>

              <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                <p className="text-zinc-400 text-sm mb-2">Security Question:</p>
                <p
                  className="text-white no-select"
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {securityQuestions[selectedUser].question}
                </p>
              </div>

              <Input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your answer..."
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-cyan-500 focus:ring-cyan-500"
                autoComplete="off"
              />

              {error && (
                <p className="text-red-400 text-center text-sm">{error}</p>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !answer.trim()}
                  className="flex-1 bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

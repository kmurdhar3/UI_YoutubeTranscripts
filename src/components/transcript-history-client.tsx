"use client";

import { useState } from "react";
import { TranscriptHistory } from "@/components/transcript-history";
import { TranscriptSummary } from "@/components/transcript-summary";

interface TranscriptHistoryClientProps {
  userId: string;
}

export function TranscriptHistoryClient({
  userId,
}: TranscriptHistoryClientProps) {
  const [activeTab, setActiveTab] = useState<"history" | "summary">("history");

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-4xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Transcript History/Summary
        </h1>
        <p className="text-lg text-gray-600">
          View and manage your transcript download history
        </p>
      </div>
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-1 text-lg font-semibold transition-colors ${
            activeTab === "history"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`pb-3 px-1 text-lg font-semibold transition-colors ${
            activeTab === "summary"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Transcript Summary
        </button>
      </div>
      {/* Tab Content */}
      {activeTab === "history" ? (
        <TranscriptHistory userId={userId} />
      ) : (
        <TranscriptSummary userId={userId} />
      )}
    </div>
  );
}

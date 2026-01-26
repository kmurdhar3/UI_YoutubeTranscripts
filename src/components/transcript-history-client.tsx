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
      <div className="mb-6 sm:mb-8">
        <h1
          className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Transcript History/Summary
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          View and manage your transcript download history
        </p>
      </div>
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-1 text-base sm:text-lg font-semibold transition-colors whitespace-nowrap ${
            activeTab === "history"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`pb-3 px-1 text-base sm:text-lg font-semibold transition-colors whitespace-nowrap ${
            activeTab === "summary"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
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

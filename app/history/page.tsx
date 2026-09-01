import type { Metadata } from "next";

import { HistoryPageClient } from "@/app/history/history-page-client";

export const metadata: Metadata = {
  title: "Listening history",
  description:
    "Your guided listening journey — sessions, reflections, and recommendations in chronological order.",
};

export default function HistoryPage() {
  return <HistoryPageClient />;
}

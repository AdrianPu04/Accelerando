import { HomePageClient } from "@/app/home-page-client";
import { getHomeStartPieces } from "@/lib/pieces";

export default function Home() {
  return <HomePageClient pieces={getHomeStartPieces()} />;
}

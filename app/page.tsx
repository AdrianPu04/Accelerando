import { HomePageClient } from "@/app/home-page-client";
import { getAllPieces } from "@/lib/pieces";

export default function Home() {
  return <HomePageClient pieces={getAllPieces()} />;
}

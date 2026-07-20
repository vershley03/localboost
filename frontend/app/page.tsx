import { auth } from "@clerk/nextjs/server";
import { HomePageClient } from "@/components/marketing/home-page-client";

export default async function Home() {
  const { userId } = await auth();

  return <HomePageClient isSignedIn={Boolean(userId)} />;
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalBoost AI — AI Marketing for Local Businesses",
  description: "Supercharge your local business with AI-powered content, brand strategy, and marketing automation. Built for small businesses that want to compete like enterprises.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}

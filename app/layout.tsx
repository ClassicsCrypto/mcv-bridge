import type { Metadata } from "next";
import "../styles/globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Mars Cats Bridge",
  description: "Bridge your Mars Cats NFTs between Ethereum and ApeChain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

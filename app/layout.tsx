import type { Metadata } from "next";
import "../styles/globals.css";
import { Providers } from "@/components/Providers";
import { Footer } from "@/components/Footer";

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
      <body className="antialiased min-h-screen flex flex-col">
        {/* Starfield background */}
        <div className="starfield" aria-hidden="true" />
        <Providers>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

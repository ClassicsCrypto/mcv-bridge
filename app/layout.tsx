import type { Metadata } from "next";
import "../styles/globals.css";
import { Providers } from "@/components/Providers";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mars Cats Bridge",
  description: "Bridge your Mars Cats NFTs between Ethereum and ApeChain",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
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
          <div className="flex-1 pb-16">
            {children}
          </div>
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-console-bg border-t border-console-border/20">
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

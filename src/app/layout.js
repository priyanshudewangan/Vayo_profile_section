import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import BackgroundVideo from "@/components/BackgroundVideo";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "VAYO - Let's do it",
  description: "VAYO Powered by Laneway. Discover people who match your vibe. No searching.Just belonging.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    type: "website",
    url: "https://www.askvayo.com/",
    title: "VAYO - Let's do it",
    description: "Discover people who match your vibe. No searching.Just belonging.",
    images: [{ url: "https://www.askvayo.com/assets/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VAYO - Let's do it",
    description: "Discover people who match your vibe. No searching.Just belonging.",
    images: ["https://www.askvayo.com/assets/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://tally.so" />
        <link rel="dns-prefetch" href="https://tally.so" />
      </head>
      <body className={`${plusJakartaSans.className} bg-[#050508] text-[#F0F0FF] overflow-x-hidden min-h-screen relative`}>
        <BackgroundVideo />
        {children}
      </body>
    </html>
  );
}

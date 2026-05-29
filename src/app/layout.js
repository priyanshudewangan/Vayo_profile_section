import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VAYO - Creating Community to Connect",
  description: "VAYO Powered by Laneway. Discover people who match your vibe. No searching. Just belonging.",
  openGraph: {
    type: "website",
    url: "https://www.askvayo.com/",
    title: "VAYO - Creating Community to Connect",
    description: "Discover people who match your vibe. No searching. Just belonging.",
    images: [{ url: "https://www.askvayo.com/assets/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VAYO - Creating Community to Connect",
    description: "Discover people who match your vibe. No searching. Just belonging.",
    images: ["https://www.askvayo.com/assets/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#050508] text-[#F0F0FF] overflow-x-hidden min-h-screen relative`}>
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#050508]">
          <video className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover" autoPlay muted loop playsInline>
            <source src="/assets/pin_bg_2.mp4" type="video/mp4" />
          </video>
          {/* Subtle responsive background gradients for mobile to keep premium feel under the video */}
          <div className="md:hidden absolute top-[-10%] left-[-20%] w-[80%] h-[60%] rounded-full bg-indigo-900/15 blur-[120px] pointer-events-none"></div>
          <div className="md:hidden absolute bottom-[20%] right-[-20%] w-[80%] h-[60%] rounded-full bg-violet-900/15 blur-[120px] pointer-events-none"></div>
        </div>
        {children}
      </body>
    </html>
  );
}

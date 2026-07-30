import { IBM_Plex_Sans, IBM_Plex_Serif, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastContext";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexSerif = IBM_Plex_Serif({
  variable: "--font-plex-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "LegalBuddy AI — Verifiable Legal AI Assistant",
  description: "Authority without intimidation. Verifiable legal intelligence for Indian Law, Constitution, IPC & BNS.",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexSerif.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="h-full min-h-screen bg-[#F6F7F9] text-[#0E1B30] font-sans antialiased selection:bg-[#0B5850] selection:text-white overflow-x-hidden">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Anton, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: {
  icon: [
    { url: "/favicon.png", type: "image/png" },
  ],
  shortcut: "/favicon.png",
},
  title: "NoodleHub - The Musician's Toolkit",
  description:
    "NoodleHub is a toolkit for musicians. Chord finder, scale explorer, metronome, BPM tapper, circle of fifths, fretboard visualizer, and more — all in your browser.",
  keywords: [
    "music tools",
    "musician tools",
    "chord finder",
    "scale finder",
    "metronome",
    "circle of fifths",
    "BPM tapper",
    "guitar chords",
    "music theory",
    "PyTheory",
    "NoodleHub",
    "noodlecafé",
  ],
  authors: [{ name: "NoodleHub" }],
  openGraph: {
    title: "NoodleHub - The Musician Toolkit",
    description:
      "A toolkit for musicians: chord finder, scale explorer, metronome, circle of fifths, fretboard visualizer, and more.",
    siteName: "NoodleHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NoodleHub — Free Musician Tools",
    description:
      "A free, open-source toolkit for musicians: chord finder, scale explorer, metronome, circle of fifths, fretboard visualizer, and more.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${anton.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

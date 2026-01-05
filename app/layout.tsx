import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Analytics } from "@/components/analytics";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.niheshr.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nihesh's Blog",
    template: "%s | Nihesh's Blog",
  },
  description:
    "Technical articles, tutorials, and thoughts on web development, DevOps, and software engineering by Nihesh.",
  keywords: [
    "blog",
    "web development",
    "programming",
    "tutorials",
    "nextjs",
    "react",
    "devops",
    "webrtc",
  ],
  authors: [{ name: "Nihesh", url: siteUrl }],
  creator: "Nihesh",
  publisher: "Nihesh",
  icons: {
    icon: "/nihesh.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://blog.niheshr.com",
    siteName: "Nihesh's Blog",
    title: "Nihesh's Blog",
    description:
      "Technical articles, tutorials, and thoughts on web development, DevOps, and software engineering.",
    images: [
      {
        url: "https://blog.niheshr.com/nihesh.png",
        width: 512,
        height: 512,
        alt: "Nihesh's Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nihesh's Blog",
    description:
      "Technical articles, tutorials, and thoughts on web development, DevOps, and software engineering.",
    images: ["https://blog.niheshr.com/nihesh.png"],
    creator: "@nihesh",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when you have them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          property="og:logo"
          content="https://blog.niheshr.com/nihesh.png"
        />
        <link rel="icon" type="image/png" href="/nihesh.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Analytics />
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

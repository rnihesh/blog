import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@/components/analytics";
import { TopLoader } from "@/components/top-loader";
import { ScrollToTopButton } from "@/components/scroll-to-top";

// Self-hosted at build time by next/font: no request to fonts.googleapis.com, no
// render-blocking stylesheet, and an auto-generated size-adjust fallback so swapping
// in the real face does not shift layout. Change a family here, not in a URL.
const fontSans = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

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
    types: {
      "application/rss+xml": [
        { url: "/rss.xml", title: "Nihesh's Blog RSS Feed" },
      ],
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${fontSans.variable} ${fontMono.variable}`}
      >
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Nihesh's Blog",
                alternateName: ["Rachakonda Nihesh"],
                url: siteUrl,
              }),
            }}
          />
          <meta
            property="og:logo"
            content="https://blog.niheshr.com/nihesh.png"
          />
          <link rel="icon" type="image/png" href="/nihesh.png" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link
            rel="alternate"
            type="application/rss+xml"
            title="Nihesh's Blog RSS Feed"
            href="/rss.xml"
          />
        </head>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TopLoader />
            <Analytics />
            {children}
            <ScrollToTopButton />
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}

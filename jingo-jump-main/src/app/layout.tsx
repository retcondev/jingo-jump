import "~/styles/globals.css";

import { type Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";

import { TRPCReactProvider } from "~/trpc/react";
import { ChatBot } from "~/app/_components/ChatBot";
import { CartProvider } from "~/context/CartContext";
import { CartDrawer } from "~/app/_components/cart/CartDrawer";
import { Providers } from "~/app/_components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://jingojump.com"),
  title: {
    default: "Jingo Jump - Commercial Bounce Houses & Inflatables",
    template: "%s | Jingo Jump",
  },
  description:
    "Shop premium commercial bounce houses, water slides & inflatables. Durable, safe designs for rental businesses & events. Top quality at competitive prices.",
  keywords: [
    "commercial bounce houses",
    "inflatable water slides",
    "bounce house for sale",
    "commercial inflatables",
    "inflatable rentals",
    "water slides",
    "obstacle courses",
    "inflatable games",
    "party inflatables",
    "bounce house manufacturer",
  ],
  robots: {
    index: true,
    follow: true,
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jingojump.com",
    siteName: "Jingo Jump",
    title: "Jingo Jump - Commercial Bounce Houses & Inflatables",
    description:
      "Shop premium commercial bounce houses, water slides & inflatables for rental businesses.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Jingo Jump Commercial Inflatables",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jingo Jump - Commercial Bounce Houses & Inflatables",
    description:
      "Shop premium commercial bounce houses, water slides & inflatables.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://jingojump.com",
  },
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <head>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js" crossOrigin="anonymous" />
      </head>
      <body className="font-poppins">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Jingo Jump",
              url: "https://jingojump.com",
              logo: "https://jingojump.com/logo.png",
              address: {
                "@type": "PostalAddress",
                streetAddress: "1506 Gardena Ave",
                addressLocality: "Glendale",
                addressRegion: "CA",
                postalCode: "91204",
                addressCountry: "US",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+1-888-720-7747",
                contactType: "customer service",
              },
              sameAs: [
                "https://www.facebook.com/jingojumpinflatables",
                "https://twitter.com/JingoJump",
                "https://www.youtube.com/channel/UCUB5pQpdQGHhWtLFBYUlukw",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Jingo Jump",
              url: "https://jingojump.com",
            }),
          }}
        />
        <Providers>
          <CartProvider>
            <TRPCReactProvider>{children}</TRPCReactProvider>
            <CartDrawer />
            <ChatBot />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}

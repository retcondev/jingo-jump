import "~/styles/globals.css";

import { type Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";

import { TRPCReactProvider } from "~/trpc/react";
import { ChatBot } from "~/app/_components/ChatBot";
import { CartProvider } from "~/context/CartContext";
import { CartDrawer } from "~/app/_components/cart/CartDrawer";

export const metadata: Metadata = {
  title: "Home",
  description: "JingoJump - Premium commercial inflatables for unforgettable events and endless fun",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
        <CartProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <CartDrawer />
          <ChatBot />
        </CartProvider>
      </body>
    </html>
  );
}

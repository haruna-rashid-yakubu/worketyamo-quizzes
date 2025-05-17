import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Simple Next JS Supabase Auth",
  description:
    "Free Supabase Auth Boilerplate Using Shadcn + Zod by Daveyreno.com",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} flex flex-col justify-between min-h-screen`}
      >
        <div className="">
          {/* <Header /> */}
          <div >{children}</div>
        </div>
        {/* <Footer /> */}
      </body>
    </html>
  );
}

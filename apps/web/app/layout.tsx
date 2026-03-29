import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SERVER_PORT } from "@CFD-V2/config";
import TRPCReactProvider from "@/providers/trpc-provider";
import { ThemesProvider } from "@/providers/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CFD-V2 by @rshdhere",
  description: "CFD-V2 by @rshdhere for understanding backend-fundamentals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <TRPCReactProvider trpcUrl={`http://localhost:${SERVER_PORT}/trpc`}>
          <ThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          />
          <main>{children}</main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}

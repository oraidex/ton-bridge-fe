import Content from "@/components/layout/content";
import Header from "@/components/layout/header";
import { AppProvider } from "@/contexts/app-provider";
import { ThemeProvider } from "@/contexts/theme-context";
import { ToastContext, ToastProvider } from "@/contexts/toasts/context";
import { TonProvider } from "@/contexts/ton-provider";
import "@/styles/_main.scss";
import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { Bounce, ToastContainer } from "react-toastify";

const inter = IBM_Plex_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["vietnamese"],
});

export const metadata: Metadata = {
  title: "OraiDex Ton Brigde",
  description: "Ton Bridge with oraichain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <ThemeProvider>
            <TonProvider>
              <ToastProvider>
                <Header />
                <Content>{children}</Content>
              </ToastProvider>
            </TonProvider>
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}

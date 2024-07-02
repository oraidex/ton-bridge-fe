"use client";

import { AppProvider } from "./app-provider";
import { ThemeProvider } from "./theme-context";
import { ToastProvider } from "./toasts/context";
import { TonProvider } from "./ton-provider";
import { FC, PropsWithChildren } from "react";

export const RootProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <ThemeProvider>
      <TonProvider>
        <AppProvider>
          {/* <ToastProvider>{children}</ToastProvider> */}
          {children}
        </AppProvider>
      </TonProvider>
    </ThemeProvider>
  );
};

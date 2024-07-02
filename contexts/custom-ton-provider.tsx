"use client";

import { THEME, TonConnectUIProvider } from "@tonconnect/ui-react";
import { createContext, useContext, useState } from "react";
import TonConnect, {
  CHAIN,
  WalletInfoCurrentlyEmbedded,
  isWalletInfoCurrentlyEmbedded,
  toUserFriendlyAddress,
} from "@tonconnect/sdk";

export const CustomTonContext = createContext<{
  connector: TonConnect;
}>({
  connector: new TonConnect({
    manifestUrl: "http://localhost:3000/manifest.json",
  }),
});

export const CustomTonProvider = (props: React.PropsWithChildren<{}>) => {
  const connector = new TonConnect({
    manifestUrl: "http://localhost:3000/manifest.json",
  });

  return (
    <CustomTonContext.Provider value={{ connector }}>
      {props.children}
    </CustomTonContext.Provider>
  );
};

export const useTonConnector = () => {
  const { connector } = useContext(CustomTonContext);

  return { connector };
};

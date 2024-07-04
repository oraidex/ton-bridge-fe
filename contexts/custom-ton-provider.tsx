"use client";

import TonConnect from "@tonconnect/sdk";
import { createContext, useContext, useEffect } from "react";
import { TonConnectStorage } from "./custom-ton-storage";
import { MANIFEST_URL } from "@/constants/config";

export const CustomTonContext = createContext<{
  connector: TonConnect;
}>({
  connector: new TonConnect({
    manifestUrl: MANIFEST_URL,
    storage: new TonConnectStorage("Ton:root"),
  }),
});

export const CustomTonProvider = (props: React.PropsWithChildren<{}>) => {
  const connector = new TonConnect({
    manifestUrl: MANIFEST_URL,
    storage: new TonConnectStorage("Ton:root"),
  });

  // useEffect(() => {
  connector.restoreConnection({
    // openingDeadlineMS: 5 * 3600 * 1000, // timeout to reconnect
  });
  // }, []);

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

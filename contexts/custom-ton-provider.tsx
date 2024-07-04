"use client";

import TonConnect from "@tonconnect/sdk";
import { createContext, useContext, useEffect } from "react";
import { TonConnectStorage } from "./custom-ton-storage";

export const CustomTonContext = createContext<{
  connector: TonConnect;
}>({
  connector: new TonConnect({
    manifestUrl: "http://localhost:3000/manifest.json",
    // storage: new TonConnectStorage("Ton:root"),
  }),
});

export const CustomTonProvider = (props: React.PropsWithChildren<{}>) => {
  const connector = new TonConnect({
    manifestUrl: "http://localhost:3000/manifest.json",
    // storage: new TonConnectStorage("Ton:root"),
  });

  useEffect(() => {
    // auto connect
    connector.restoreConnection();
  }, []);

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

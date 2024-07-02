"use client";

import { THEME, TonConnectUIProvider } from "@tonconnect/ui-react";

export const TonProvider = (props: React.PropsWithChildren<{}>) => {
  return (
    <TonConnectUIProvider
      manifestUrl="http://localhost:3000/manifest.json"
      uiPreferences={{ theme: THEME.DARK }}
    >
      {props.children}
    </TonConnectUIProvider>
  );
};

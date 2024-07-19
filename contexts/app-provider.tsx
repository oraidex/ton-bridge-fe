"use client";

import { TonNetwork, network } from "@/constants/networks";
import { useLoadToken, useLoadTonBalance } from "@/hooks/useLoadToken";
import { getCosmWasmClient } from "@/libs/cosmjs";
import Keplr from "@/libs/keplr";
import Metamask from "@/libs/metamask";
import { polyfill } from "@/polyfill";
import {
  useAuthOraiAddress,
  useAuthOraiWallet,
  useAuthTonAddress,
  useAuthenticationActions,
} from "@/stores/authentication/selector";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import {
  HttpClient,
  Tendermint37Client,
  WebsocketClient,
} from "@cosmjs/tendermint-rpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isMobile } from "@walletconnect/browser-utils";
import React, { useEffect } from "react";
import { TToastType, displayToast } from "./toasts/Toast";

if (typeof window !== "undefined") {
  polyfill();

  // init queryClient
  const useHttp =
    network.rpc.startsWith("http://") || network.rpc.startsWith("https://");
  const rpcClient = useHttp
    ? new HttpClient(network.rpc)
    : new WebsocketClient(network.rpc);

  // @ts-ignore
  window.client = new CosmWasmClient(new Tendermint37Client(rpcClient));
}

const queryClient = new QueryClient();
console.log(
  "process.env.NEXT_PUBLIC_MIXPANEL_TOKEN",
  process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
);

export const AppProvider = (props: React.PropsWithChildren<{}>) => {
  const walletType = useAuthOraiWallet();
  const mobileMode = isMobile();
  const oraiWallet = useAuthOraiWallet();
  const oraiAddress = useAuthOraiAddress();
  const tonAddress = useAuthTonAddress();
  const { handleSetOraiWallet, handleSetOraiAddress } =
    useAuthenticationActions();

  const { loadToken } = useLoadToken();
  const { loadAllBalanceTonToken } = useLoadTonBalance({
    tonAddress,
    tonNetwork: TonNetwork.Mainnet,
  });

  const keplrHandler = async () => {
    try {
      let oraiAddress;

      if (mobileMode) {
        window.tronWebDapp = window.tronWeb;
        window.tronLinkDapp = window.tronLink;
        window.ethereumDapp = window.ethereum;
        window.Keplr = new Keplr("owallet");
        window.Metamask = new Metamask(window.tronWebDapp);
      }

      if (oraiWallet || mobileMode) {
        oraiAddress = await window.Keplr.getKeplrAddr();

        if (oraiAddress) {
          handleSetOraiAddress({ oraiAddress });
        }
      }
      // loadToken({
      //   oraiAddress,
      // });
    } catch (error) {
      console.log("Error: ", error.message);
      displayToast(TToastType.TX_INFO, {
        message: `There is an unexpected error with Cosmos wallet. Please try again!`,
      });
    }
  };

  useEffect(() => {
    (mobileMode || oraiAddress) && keplrHandler();
  }, [mobileMode]);

  useEffect(() => {
    window.addEventListener("keplr_keystorechange", keplrHandler);
    return () => {
      window.removeEventListener("keplr_keystorechange", keplrHandler);
    };
  }, []);

  useEffect(() => {
    loadToken({
      oraiAddress,
    });
  }, [oraiAddress]);

  useEffect(() => {
    (async () => {
      if (walletType && typeof window !== "undefined") {
        const cosmWasmClient = await getCosmWasmClient({
          chainId: network.chainId,
        });
        if (cosmWasmClient && cosmWasmClient.client) {
          window.client = cosmWasmClient.client;
        }
      }
    })();
  }, [walletType]);

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
};

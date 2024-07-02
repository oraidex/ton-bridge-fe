"use client";

import { network } from "@/constants/networks";
import { getCosmWasmClient } from "@/libs/cosmjs";
import { polyfill } from "@/polyfill";
import { useAuthOraiWallet } from "@/stores/authentication/selector";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import {
  HttpClient,
  Tendermint37Client,
  WebsocketClient,
} from "@cosmjs/tendermint-rpc";
import React, { useEffect, useState } from "react";

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

export const AppProvider = (props: React.PropsWithChildren<{}>) => {
  const walletType = useAuthOraiWallet();

  useEffect(() => {
    // if (typeof window !== "undefined") {
    // polyfill();
    // init queryClient
    // const useHttp =
    //   network.rpc.startsWith("http://") || network.rpc.startsWith("https://");
    // const rpcClient = useHttp
    //   ? new HttpClient(network.rpc)
    //   : new WebsocketClient(network.rpc);
    // @ts-ignore
    // window.client = new CosmWasmClient(new Tendermint37Client(rpcClient));
    // }
  }, []);

  useEffect(() => {
    (async () => {
      if (walletType && typeof window !== "undefined") {
        const cosmWasmClient = await getCosmWasmClient({
          chainId: network.chainId,
        });
        console.log("cosmWasmClient", cosmWasmClient);
        if (cosmWasmClient && cosmWasmClient.client) {
          window.client = cosmWasmClient.client;
        }
      }
    })();
  }, [walletType]);

  return <>{props.children}</>;
};

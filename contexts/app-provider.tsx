"use client";

import { network } from "@/constants/networks";
import { getCosmWasmClient } from "@/libs/cosmjs";
import "@/polyfill";
import { useAuthOraiWallet } from "@/stores/authentication/selector";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import {
  HttpClient,
  Tendermint37Client,
  WebsocketClient,
} from "@cosmjs/tendermint-rpc";
import React, { useEffect } from "react";

// init queryClient
const useHttp =
  network.rpc.startsWith("http://") || network.rpc.startsWith("https://");
const rpcClient = useHttp
  ? new HttpClient(network.rpc)
  : new WebsocketClient(network.rpc);

// @ts-ignore
window.client = new CosmWasmClient(new Tendermint37Client(rpcClient));

export const AppProvider = (props: React.PropsWithChildren<{}>) => {
  const walletType = useAuthOraiWallet();

  useEffect(() => {
    (async () => {
      if (walletType) {
        const cosmWasmClient = await getCosmWasmClient({
          chainId: network.chainId,
        });
        if (cosmWasmClient && cosmWasmClient.client)
          window.client = cosmWasmClient.client;
      }
    })();
  }, [walletType]);

  return <>{props.children}</>;
};

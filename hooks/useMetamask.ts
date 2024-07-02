import { isMobile } from "@walletconnect/browser-utils";
import { useEffect } from "react";
// import useLoadTokens from './useLoadTokens';
import { ethers } from "ethers";
import { getAddressByEIP191, getWalletByNetworkFromStorage } from "@/helper";
import {
  useAuthOraiAddress,
  useAuthenticationActions,
} from "@/stores/authentication/selector";
import { useRouter, usePathname } from "next/navigation";

const loadAccounts = async (): Promise<string[]> => {
  if (!window.ethereum) return;
  if (isMobile()) await window.Metamask.switchNetwork(Networks.bsc);
  // passe cointype 60 for ethereum or let it use default param
  let accounts = await window.ethereumDapp.request({
    method: "eth_accounts",
    params: [60],
  });
  if (accounts.length === 0) {
    accounts = await window.ethereumDapp.request({
      method: "eth_requestAccounts",
      params: [],
    });
  }
  return accounts;
};

export function useEagerConnect() {
  // const loadTokenAmounts = useLoadTokens();
  const oraiAddress = useAuthOraiAddress();
  const { handleSetOraiAddress } = useAuthenticationActions();
  const pathname = usePathname();
  // const [chainInfo] = useConfigReducer('chainInfo');
  const mobileMode = isMobile();

  const connect = async (
    accounts?: string[],
    currentConnectingEvmWalletType?: string
  ) => {
    try {
      accounts = Array.isArray(accounts) ? accounts : await loadAccounts();
      if (accounts && accounts?.length > 0) {
        const metamaskAddress = ethers.utils.getAddress(accounts[0]);

        // // current connecting evm wallet
        // if (currentConnectingEvmWalletType) {
        //   loadTokenAmounts({ metamaskAddress });
        //   handleSetOraiAddress(metamaskAddress);
        //   return;
        // }

        const walletByNetworks = getWalletByNetworkFromStorage();

        if (walletByNetworks.cosmos === "eip191") {
          const isSwitchEIP = true;
          const oraiAddress = await getAddressByEIP191(isSwitchEIP);
          handleSetOraiAddress({ oraiAddress });
          // setCosmosAddress({
          //   Oraichain: oraiAddress
          // });
          // loadTokenAmounts({ oraiAddress });
        }
      } else {
        handleSetOraiAddress(undefined);
      }
    } catch (error) {
      console.log({ errorConnectMetmask: error });
    }
  };

  useEffect(() => {
    // just auto connect metamask in mobile
    mobileMode && connect();
  }, [mobileMode, pathname]);

  return connect;
}

export function useInactiveConnect() {
  const connect = useEagerConnect();

  useEffect(() => {
    const { ethereum } = window;
    if (ethereum && ethereum.on) {
      // ethereum.on('connect', connect);
      ethereum.on("accountsChanged", connect);
      return () => {
        if (ethereum.removeListener) {
          // ethereum.removeListener('connect', connect);
          ethereum.removeListener("accountsChanged", connect);
        }
      };
    }
  }, []);
  return connect;
}

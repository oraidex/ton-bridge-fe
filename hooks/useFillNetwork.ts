import { NetworkList } from "@/components/page/bridge";
import { tokenMap } from "@oraichain/oraidex-common";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const FROM_QUERY_KEY = "fromNetwork";
export const TO_QUERY_KEY = "toNetwork";

export const initFromNetwork = () => {
  if (typeof window !== "undefined") {
    const queryString = window.location?.search;

    const params = new URLSearchParams(queryString || "");

    const currentFromNetwork = params.get(FROM_QUERY_KEY);
    const currentNetwork =
      currentFromNetwork === NetworkList.oraichain.id || !currentFromNetwork
        ? NetworkList.ton
        : NetworkList[currentFromNetwork];

    return currentNetwork || NetworkList.ton;
  }
  return NetworkList.ton;
};

export const initToNetwork = () => {
  if (typeof window !== "undefined") {
    const queryString = window.location?.search;

    const params = new URLSearchParams(queryString || "");
    const currentToNetwork = params.get(TO_QUERY_KEY);
    const currentNetwork =
      currentToNetwork === NetworkList.ton.id || !currentToNetwork
        ? NetworkList.oraichain
        : NetworkList[currentToNetwork];

    return currentNetwork || NetworkList.oraichain;
  }

  return NetworkList.oraichain;
};

export const useFillNetwork = ({
  setFromNetwork,
  setToNetwork,
}: {
  setFromNetwork: (network: any) => void;
  setToNetwork: (network: any) => void;
}) => {
  const path = usePathname();
  const router = useRouter();

  const handleUpdateQueryURL = ([fromNetwork, toNetwork]: [string, string]) => {
    const queryString = location.search;

    if (!fromNetwork || !toNetwork) {
      return;
    }
    const params = new URLSearchParams(queryString || "");

    const currentFromNetwork = params.get(FROM_QUERY_KEY);
    const currentToNetwork = params.get(TO_QUERY_KEY);

    const originalFromNetwork =
      fromNetwork === NetworkList.oraichain.id || !fromNetwork
        ? NetworkList.oraichain
        : NetworkList.ton;
    const originalToNetwork =
      toNetwork === NetworkList.ton.id || !toNetwork
        ? NetworkList.ton
        : NetworkList.oraichain;

    if (
      originalFromNetwork &&
      originalToNetwork &&
      (currentFromNetwork !== fromNetwork || currentToNetwork !== toNetwork)
    ) {
      currentFromNetwork !== fromNetwork &&
        params.set(FROM_QUERY_KEY, fromNetwork);
      currentToNetwork !== toNetwork && params.set(TO_QUERY_KEY, toNetwork);

      const newUrl = `${path}?${params.toString()}`;

      router.push(newUrl);
    }
  };

  //   useEffect(() => {
  //     const queryString = location.search;
  //     const params = new URLSearchParams(queryString || "");
  //     const fromNetwork = params.get(FROM_QUERY_KEY);
  //     const toNetwork = params.get(TO_QUERY_KEY);

  //     const originalFromNetwork =
  //       fromNetwork === NetworkList.oraichain.id || !fromNetwork
  //         ? NetworkList.oraichain
  //         : NetworkList.ton;
  //     const originalToNetwork =
  //       toNetwork === NetworkList.ton.id || !toNetwork
  //         ? NetworkList.ton
  //         : NetworkList.oraichain;

  //     if (originalFromNetwork && originalToNetwork) {
  //       setFromNetwork(originalFromNetwork);
  //       setToNetwork(originalToNetwork);
  //     } else {
  //       router.push("/");
  //     }
  //   }, [location.search, location.pathname]);

  return {
    handleUpdateQueryURL,
  };
};

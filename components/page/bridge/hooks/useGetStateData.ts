import { getNetworkConfig } from "@/constants/networks";
import { TokenType } from "@/constants/tokens";
import { Environment } from "@/constants/ton";
import { useAuthOraiAddress } from "@/stores/authentication/selector";
import { TonbridgeBridgeClient } from "@oraichain/tonbridge-contracts-sdk";
import { useEffect, useState } from "react";

const env = process.env.NEXT_PUBLIC_ENV as Environment;

const useGetStateData = () => {
  const oraiAddress = useAuthOraiAddress();
  const [balances, setBalances] = useState([]);

  const getChanelStateData = async () => {
    const tonBridgeClient = new TonbridgeBridgeClient(
      window.client,
      oraiAddress,
      getNetworkConfig(env).CW_TON_BRIDGE
    );

    const config = await tonBridgeClient.channelStateData();
    if (config) {
      const { balances } = config;
      setBalances(balances);
    }
  };

  useEffect(() => {
    getChanelStateData();
  }, []);

  return { balances, getChanelStateData };
};

export default useGetStateData;

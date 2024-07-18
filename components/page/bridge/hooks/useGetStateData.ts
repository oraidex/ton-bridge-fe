import { network } from "@/constants/networks";
import { TokenType } from "@/constants/tokens";
import { useAuthOraiAddress } from "@/stores/authentication/selector";
import { TonbridgeBridgeClient } from "@oraichain/tonbridge-contracts-sdk";
import { useEffect, useState } from "react";

const useGetStateData = () => {
  const oraiAddress = useAuthOraiAddress();
  const [balances, setBalances] = useState([]);

  const getChanelStateData = async () => {
    const tonBridgeClient = new TonbridgeBridgeClient(
      window.client,
      oraiAddress,
      network.CW_TON_BRIDGE
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

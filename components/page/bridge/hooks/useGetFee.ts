import { network, TonNetwork } from "@/constants/networks";
import { TokenType, TonTokenList } from "@/constants/tokens";
import { useAuthOraiAddress } from "@/stores/authentication/selector";
import { BigDecimal, toDisplay } from "@oraichain/oraidex-common";
import { TonbridgeBridgeClient } from "@oraichain/tonbridge-contracts-sdk";
import { useEffect, useState } from "react";

const useGetFee = ({ token }: { token: TokenType }) => {
  const oraiAddress = useAuthOraiAddress();
  const [bridgeFee, setBridgeFee] = useState(0);
  const [tokenFee, setTokenFee] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        if (token) {
          const tokenInTon = TonTokenList(TonNetwork.Mainnet).find(
            (tk) => tk.coingeckoId === token.coingeckoId
          );
          if (!tokenInTon) {
            return;
          }

          const tonBridgeClient = new TonbridgeBridgeClient(
            window.client,
            oraiAddress,
            network.CW_TON_BRIDGE
          );

          const tokenFeeConfig = await tonBridgeClient.tokenFee({
            remoteTokenDenom: tokenInTon?.contractAddress,
          });

          if (tokenFeeConfig) {
            const { nominator, denominator } = tokenFeeConfig;
            const fee = new BigDecimal(nominator).div(denominator).toNumber();

            setTokenFee(fee);
          }
        }
      } catch (error) {
        console.log("error", error);
      }
    })();
  }, [token, oraiAddress]);

  useEffect(() => {
    (async () => {
      const tonBridgeClient = new TonbridgeBridgeClient(
        window.client,
        oraiAddress,
        network.CW_TON_BRIDGE
      );

      const config = await tonBridgeClient.config();
      if (config) {
        const { relayer_fee } = config;

        setBridgeFee(toDisplay(relayer_fee));
      }
    })();
  }, []);

  return {
    bridgeFee,
    tokenFee,
  };
};

export default useGetFee;

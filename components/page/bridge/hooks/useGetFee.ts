import { TonNetwork } from "@/constants/ton";
import { network } from "@/constants/networks";
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
        if (
          error.message
            .toString()
            .includes("type: tonbridge_bridge::state::Ratio; key:")
        ) {
          setTokenFee(0);
        } else {
          console.log(error);
        }
      }
    })();
  }, [token, oraiAddress]);

  useEffect(() => {
    (async () => {
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

        const config = await tonBridgeClient.pairMapping({
          key: tokenInTon?.contractAddress,
        });
        const pairMapping = config.pair_mapping;

        setBridgeFee(
          parseInt(pairMapping.relayer_fee) / 10 ** pairMapping.remote_decimals
        );
      }
    })();
  }, [token, oraiAddress]);

  return {
    bridgeFee,
    tokenFee,
  };
};

export default useGetFee;

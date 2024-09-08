import { Environment } from "@/constants/ton";
import { getNetworkConfig } from "@/constants/networks";
import { TokenType, TonTokenList } from "@/constants/tokens";
import { useAuthOraiAddress } from "@/stores/authentication/selector";
import { BigDecimal } from "@oraichain/oraidex-common";
import { TonbridgeBridgeClient } from "@oraichain/tonbridge-contracts-sdk";
import { useEffect, useState } from "react";
import { useWalletsTonCache } from "@/stores/token/selector";

const useGetFee = ({ token }: { token: TokenType }) => {
  const oraiAddress = useAuthOraiAddress();
  const [bridgeFee, setBridgeFee] = useState(0);
  const [tokenFee, setTokenFee] = useState(0);
  const network = getNetworkConfig(process.env.NEXT_PUBLIC_ENV as Environment);
  const walletsTon = useWalletsTonCache();

  useEffect(() => {
    (async () => {
      try {
        if (token) {
          const tokenInTon = TonTokenList(
            process.env.NEXT_PUBLIC_ENV as Environment
          ).find((tk) => tk.coingeckoId === token.coingeckoId);
          if (!tokenInTon) {
            return;
          }
          const walletTon = walletsTon[tokenInTon.denom];
          if (!walletTon) {
            return;
          }

          const tonBridgeClient = new TonbridgeBridgeClient(
            window.client,
            oraiAddress,
            network.CW_TON_BRIDGE
          );

          // TODO: change to jetton wallet address of bridge adapter instead
          const tokenFeeConfig = await tonBridgeClient.tokenFee({
            remoteTokenDenom: walletTon,
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
  }, [token, oraiAddress, walletsTon]);

  useEffect(() => {
    (async () => {
      if (token) {
        const tokenInTon = TonTokenList(
          process.env.NEXT_PUBLIC_ENV as Environment
        ).find((tk) => tk.coingeckoId === token.coingeckoId);
        if (!tokenInTon) {
          return;
        }

        const walletTon = walletsTon[tokenInTon.denom];
        if (!walletTon) {
          return;
        }

        const tonBridgeClient = new TonbridgeBridgeClient(
          window.client,
          oraiAddress,
          network.CW_TON_BRIDGE
        );

        const config = await tonBridgeClient.pairMapping({
          key: walletTon,
        });
        const pairMapping = config.pair_mapping;

        setBridgeFee(
          parseInt(pairMapping.relayer_fee) / 10 ** pairMapping.remote_decimals
        );
      }
    })();
  }, [token, oraiAddress, walletsTon]);

  return {
    bridgeFee,
    tokenFee,
  };
};

export default useGetFee;

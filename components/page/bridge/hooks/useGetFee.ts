import { Environment } from "@/constants/ton";
import { getNetworkConfig } from "@/constants/networks";
import { TokenType, TonTokenList } from "@/constants/tokens";
import { useAuthOraiAddress } from "@/stores/authentication/selector";
import { BigDecimal } from "@oraichain/oraidex-common";
import { TonbridgeBridgeClient } from "@oraichain/tonbridge-contracts-sdk";
import { useEffect, useState } from "react";
import { MappingJettonWalletAddress } from "@/constants/contract";

const useGetFee = ({ token }: { token: TokenType }) => {
  const oraiAddress = useAuthOraiAddress();
  const [bridgeFee, setBridgeFee] = useState(0);
  const [tokenFee, setTokenFee] = useState(0);
  const network = getNetworkConfig(Environment.Mainnet);

  useEffect(() => {
    (async () => {
      try {
        if (token) {
          const tokenInTon = TonTokenList(Environment.Mainnet).find(
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

          // TODO: change to jetton wallet address of bridge adapter instead

          console.log(
            MappingJettonWalletAddress[tokenInTon?.contractAddress] ==
              "EQAacZPtQpnIHS1PlQgVaceb_I4v2HE3rvrZC91ynSRqXd9d"
          );
          if (
            MappingJettonWalletAddress[tokenInTon?.contractAddress] ==
            "EQAacZPtQpnIHS1PlQgVaceb_I4v2HE3rvrZC91ynSRqXd9d"
          ) {
            setTokenFee(15);
            return;
          }
          const tokenFeeConfig = await tonBridgeClient.tokenFee({
            remoteTokenDenom:
              MappingJettonWalletAddress[tokenInTon?.contractAddress],
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
        const tokenInTon = TonTokenList(Environment.Mainnet).find(
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
          key: MappingJettonWalletAddress[tokenInTon?.contractAddress],
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

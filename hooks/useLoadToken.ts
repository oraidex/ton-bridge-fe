"use client";

import {
  cosmosTokens,
  oraichainTokens,
  tokenMap,
} from "@/constants/bridgeTokens";
import { chainInfos } from "@/constants/chainInfo";
import { TonNetwork, TonTokensContract, network } from "@/constants/networks";
import { OraichainTokenList, TonTokenList } from "@/constants/tokens";
import { genAddressCosmos, handleCheckWallet } from "@/helper";
import {
  useAuthOraiAddress,
  useAuthTonAddress,
} from "@/stores/authentication/selector";
import { useAmountsCache, useTokenActions } from "@/stores/token/selector";
import { fromBinary, toBinary } from "@cosmjs/cosmwasm-stargate";
import { StargateClient } from "@cosmjs/stargate";
import { MulticallQueryClient } from "@oraichain/common-contracts-sdk";
import { OraiswapTokenTypes } from "@oraichain/oraidex-contracts-sdk";
import { useEffect } from "react";

import {
  JettonMinter,
  JettonOpCodes,
  JettonWallet,
} from "@oraichain/ton-bridge-contracts";
import { TonbridgeBridgeClient } from "@oraichain/tonbridge-contracts-sdk";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { Address, Cell, Dictionary, beginCell, toNano } from "@ton/core";
import { TonClient } from "@ton/ton";
import { Base64 } from "@tonconnect/protocol";
import { toDisplay } from "@oraichain/oraidex-common";

async function loadNativeBalance(
  dispatch: (amount: AmountDetails) => void,
  address: string,
  tokenInfo: { chainId: string; rpc: string }
) {
  if (!address) return;
  try {
    const client = await StargateClient.connect(tokenInfo.rpc);
    const amountAll = await client.getAllBalances(address);

    let amountDetails: AmountDetails = {};

    // reset native balances
    cosmosTokens
      .filter((t) => t.chainId === tokenInfo.chainId && !t.contractAddress)
      .forEach((t) => {
        amountDetails[t.denom] = "0";
      });

    const tokensAmount = amountAll
      .filter((coin) => tokenMap[coin.denom])
      .map((coin) => [coin.denom, coin.amount]);
    Object.assign(amountDetails, Object.fromEntries(tokensAmount));

    dispatch(amountDetails);
  } catch (ex) {
    console.trace("errror");
    console.log(ex);
  }
}

const timer = {};

async function loadTokensCosmos(
  dispatch: (amount: AmountDetails) => void,
  kwtAddress: string,
  oraiAddress: string
) {
  if (!kwtAddress && !oraiAddress) return;
  await handleCheckWallet();
  const cosmosInfos = chainInfos.filter(
    (chainInfo) =>
      (chainInfo.networkType === "cosmos" ||
        chainInfo.bip44.coinType === 118) &&
      // TODO: ignore oraibtc
      chainInfo.chainId !== ("oraibtc-mainnet-1" as string)
  );
  for (const chainInfo of cosmosInfos) {
    const { cosmosAddress } = genAddressCosmos(
      chainInfo,
      kwtAddress,
      oraiAddress
    );
    if (!cosmosAddress) continue;
    loadNativeBalance(dispatch, cosmosAddress, chainInfo);
  }
}

async function loadCw20Balance(
  dispatch: (amount: AmountDetails) => void,
  address: string
) {
  if (!address) return;

  // get all cw20 token contract
  const cw20Tokens = [...oraichainTokens.filter((t) => t.contractAddress)];

  const data = toBinary({
    balance: { address },
  });

  const multicall = new MulticallQueryClient(window.client, network.multicall);

  const res = await multicall.aggregate({
    queries: cw20Tokens.map((t) => ({
      address: t.contractAddress,
      data,
    })),
  });

  const amountDetails = Object.fromEntries(
    cw20Tokens.map((t, ind) => {
      if (!res.return_data[ind].success) {
        return [t.denom, 0];
      }
      const balanceRes = fromBinary(
        res.return_data[ind].data
      ) as OraiswapTokenTypes.BalanceResponse;
      const amount = balanceRes.balance;
      return [t.denom, amount];
    })
  );

  dispatch(amountDetails);

  return amountDetails;
}

async function loadCw20BalanceWithSpecificTokens(
  dispatch: (amount: AmountDetails) => void,
  address: string,
  specificTokens: string[]
) {
  if (!address) return;

  // get all cw20 token contract
  const cw20Tokens = [
    ...oraichainTokens.filter(
      (t) => t.contractAddress && specificTokens.includes(t.contractAddress)
    ),
  ];

  const data = toBinary({
    balance: { address },
  });

  const multicall = new MulticallQueryClient(window.client, network.multicall);

  const res = await multicall.aggregate({
    queries: cw20Tokens.map((t) => ({
      address: t.contractAddress,
      data,
    })),
  });

  const amountDetails = Object.fromEntries(
    cw20Tokens.map((t, ind) => {
      if (!res.return_data[ind].success) {
        return [t.denom, 0];
      }
      const balanceRes = fromBinary(
        res.return_data[ind].data
      ) as OraiswapTokenTypes.BalanceResponse;
      const amount = balanceRes.balance;
      return [t.denom, amount];
    })
  );

  dispatch(amountDetails);

  return amountDetails;
}

// async function loadNativeBtcBalance(address: string, chain: CustomChainInfo) {
//   const data = await getUtxos(address, chain.rest);
//   const total = reduce(
//     data,
//     function (sum, n) {
//       return sum + n.value;
//     },
//     0
//   );

//   return total;
// }

export const useLoadTonBalance = ({
  tonAddress,
  tonNetwork,
}: {
  tonAddress: string;
  tonNetwork: TonNetwork;
  // address: string
}) => {
  const { handleSetAmountsCache, handleSetTonAmountsCache } = useTokenActions();
  const loadBalanceByToken = async (address: string) => {
    try {
      const token = TonTokenList(tonNetwork).find(
        (e) => e.contractAddress === address
      );

      // get the decentralized RPC endpoint
      const endpoint = await getHttpEndpoint();
      const client = new TonClient({
        endpoint,
      });
      const jettonMinter = JettonMinter.createFromAddress(
        Address.parse(address)
      );
      const jettonMinterContract = client.open(jettonMinter);
      const jettonWalletAddress = await jettonMinterContract.getWalletAddress(
        Address.parse(tonAddress)
      );
      const jettonWallet = JettonWallet.createFromAddress(jettonWalletAddress);
      const jettonWalletContract = client.open(jettonWallet);
      const balance = await jettonWalletContract.getBalance();

      handleSetTonAmountsCache({
        [token.denom]: toDisplay(balance.amount || "0").toString(),
      });

      return {
        jettonWalletAddress,
      };
    } catch (error) {
      console.log("error load ton balance", error);
      return {};
    }
  };

  // @dev: this function will changed based on token minter address (which is USDT, USDC, bla bla bla)
  useEffect(() => {
    (async () => {
      // if (!address) return;
      const allTokens = Object.values(TonTokensContract[tonNetwork]);

      const fullData = await Promise.all(
        allTokens.map(async (item) => {
          const endpoint = await getHttpEndpoint();
          const client = new TonClient({
            endpoint,
          });
          const jettonMinter = JettonMinter.createFromAddress(
            Address.parse(item)
          );
          const jettonMinterContract = client.open(jettonMinter);
          const jettonWalletAddress =
            await jettonMinterContract.getWalletAddress(
              Address.parse(tonAddress)
            );
          const jettonWallet =
            JettonWallet.createFromAddress(jettonWalletAddress);
          const jettonWalletContract = client.open(jettonWallet);
          const balance = await jettonWalletContract.getBalance();

          return {
            balance,
            jettonWalletAddress,
            token: item,
          };
        })
      );

      let amountDetail: AmountDetails = {};
      fullData?.map((data) => {
        const token = TonTokenList(tonNetwork).find(
          (e) => e.contractAddress === data.token
        );

        amountDetail = {
          ...amountDetail,
          [token.denom]: toDisplay(data.balance?.amount || "0").toString(),
        };
      });

      handleSetTonAmountsCache(amountDetail);
    })();
  }, [tonAddress, tonNetwork]);

  return {
    loadBalanceByToken,
  };
};

const loadTonBalance = (
  dispatch: (amount: AmountDetails) => void,
  address: string
) => {
  return {};
};

export const useLoadToken = () => {
  const amounts = useAmountsCache();
  const { handleSetAmountsCache, handleSetTonAmountsCache } = useTokenActions();
  //   const oraiAddress = useAuthOraiAddress();
  //   const tonAddress = useAuthTonAddress();

  const loadToken = ({
    oraiAddress,
    tonAddress,
  }: {
    oraiAddress?: string;
    tonAddress?: string;
  }) => {
    if (oraiAddress) {
      loadNativeBalance(
        (amounts) => handleSetAmountsCache(amounts),
        oraiAddress,
        { chainId: network.chainId, rpc: network.rpc }
      );
      loadCw20Balance((amounts) => handleSetAmountsCache(amounts), oraiAddress);
    }

    if (tonAddress) {
      loadTonBalance(
        (amounts) => handleSetTonAmountsCache(amounts),
        oraiAddress
      );
    }
  };

  return {
    loadToken,
  };
};

import { UsdcIcon, UsdtIcon } from "@/assets/icons/token";
import { USDC_CONTRACT, USDT_CONTRACT } from "@oraichain/oraidex-common";
import { CW20_TON_CONTRACT, TonNetwork, TonTokensContract } from "./networks";
import { TonNetworkICon } from "@/assets/icons/network";

export type TokenType = {
  name: string;
  symbol: string;
  Icon: () => JSX.Element;
  contractAddress: string;
  denom: string;
  coingeckoId: string;
  decimal: number;
};

export const OraichainTokenList: TokenType[] = [
  {
    name: "Tether",
    symbol: "USDT",
    Icon: UsdtIcon,
    contractAddress: USDT_CONTRACT,
    denom: "usdt",
    coingeckoId: "tether",
    decimal: 6,
  },
  // {
  //   name: "USD Coin",
  //   symbol: "USDC",
  //   Icon: UsdcIcon,
  //   contractAddress: USDC_CONTRACT,
  //   denom: "usdc",
  //   coingeckoId: "usd-coin",
  //   decimal: 6,
  // },
  // {
  //   name: "Ton",
  //   symbol: "TON",
  //   Icon: TonNetworkICon,
  //   contractAddress: CW20_TON_CONTRACT,
  //   denom: "cw20_ton",
  //   coingeckoId: "the-open-network",
  //   decimal: 6,
  // },
];

export const TonTokenList = (network: TonNetwork): TokenType[] => [
  {
    name: "Tether",
    symbol: "jUSDT",
    Icon: UsdtIcon,
    contractAddress: TonTokensContract[network].usdt,
    denom: "ton20_usdt",
    coingeckoId: "tether",
    decimal: 6,
  },
  // {
  //   name: "USD Coin",
  //   symbol: "USDC",
  //   Icon: UsdcIcon,
  //   contractAddress: TonTokensContract[network].usdc,
  //   denom: "ton20_usdc",
  //   coingeckoId: "usd-coin",
  //   decimal: 6,
  // },
  // {
  //   name: "Ton",
  //   symbol: "TON",
  //   Icon: TonNetworkICon,
  //   contractAddress: TonTokensContract[network].ton,
  //   denom: "ton",
  //   coingeckoId: "the-open-network",
  //   decimal: 9,
  // },
];

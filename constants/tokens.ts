import { UsdcIcon, UsdtIcon } from "@/assets/icons/token";
import { USDC_CONTRACT, USDT_CONTRACT } from "@oraichain/oraidex-common";
import { TonNetwork, TonTokensContract } from "./networks";
import { TonNetworkICon } from "@/assets/icons/network";

export const OraichainTokenList = [
  {
    name: "Tether",
    symbol: "USDT",
    Icon: UsdtIcon,
    contractAddress: USDT_CONTRACT,
    denom: "usdt",
    coingeckoId: "tether",
    decimal: 6,
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    Icon: UsdcIcon,
    contractAddress: USDC_CONTRACT,
    denom: "usdc",
    coingeckoId: "usd-coin",
    decimal: 6,
  },
  {
    name: "Ton",
    symbol: "TON",
    Icon: TonNetworkICon,
    contractAddress: null,
    denom: "native_ton",
    coingeckoId: "toncoin",
    decimal: 9,
  },
];

export const TonTokenList = (network: TonNetwork) => [
  {
    name: "Tether",
    symbol: "USDT",
    Icon: UsdtIcon,
    contractAddress: TonTokensContract[network].usdt,
    denom: "ton20_usdt",
    coingeckoId: "tether",
    decimal: 6,
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    Icon: UsdcIcon,
    contractAddress: TonTokensContract[network].usdc,
    denom: "ton20_usdc",
    coingeckoId: "usd-coin",
    decimal: 6,
  },
  {
    name: "Ton",
    symbol: "TON",
    Icon: TonNetworkICon,
    contractAddress: null,
    denom: "ton",
    coingeckoId: "toncoin",
    decimal: 9,
  },
];

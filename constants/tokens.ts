import { TonNetwork } from "./ton";
import { TonTokensContract } from "./contract";
import { UsdtIcon, TetherIcon } from "@/assets/icons/token";
import { USDT_CONTRACT } from "@oraichain/oraidex-common";
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

export const TON_DENOM = `factory/orai17hyr3eg92fv34fdnkend48scu32hn26gqxw3hnwkfy904lk9r09qqzty42/XuanDang`;

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
  {
    name: "Ton",
    symbol: "TON",
    Icon: TonNetworkICon,
    contractAddress: null,
    denom: TON_DENOM,
    coingeckoId: "the-open-network",
    decimal: 9,
  },
];

export const TonTokenList = (network: TonNetwork): TokenType[] => [
  {
    name: "Tether",
    symbol: "USDT",
    Icon: TetherIcon,
    contractAddress: TonTokensContract[network].usdt,
    denom: "ton20_usdt",
    coingeckoId: "tether",
    decimal: 6,
  },
  {
    name: "Ton",
    symbol: "TON",
    Icon: TonNetworkICon,
    contractAddress: TonTokensContract[network].ton,
    denom: "ton",
    coingeckoId: "the-open-network",
    decimal: 9,
  },
];

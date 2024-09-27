import { Environment } from "./ton";
import { TonTokensContract } from "./contract";
import {
  UsdtIcon,
  TetherIcon,
  UsdcIcon,
  HmstrIcon,
} from "@/assets/icons/token";
import { USDC_CONTRACT, USDT_CONTRACT } from "@oraichain/oraidex-common";
import { TonNetworkICon } from "@/assets/icons/network";

export type TokenType = {
  chainId?: string;
  name: string;
  symbol: string;
  Icon: () => JSX.Element;
  contractAddress: string;
  denom: string;
  coingeckoId: string;
  decimal: number;
  alloyedToken?: boolean;
  mintBurn?: boolean;
};

export const TON_DENOM = `factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/ton`;
export const HMSTR_DENOM = `factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/HMSTR`;

export const OraichainTokenList = (network: Environment): TokenType[] => [
  {
    chainId: "Oraichain",
    name: "Tether",
    symbol: "USDT",
    Icon: UsdtIcon,
    contractAddress: USDT_CONTRACT,
    denom: "usdt",
    coingeckoId: "tether",
    decimal: 6,
  },
  {
    chainId: "Oraichain",
    name: "Ton",
    symbol: "TON",
    Icon: TonNetworkICon,
    contractAddress: null,
    denom: TON_DENOM,
    coingeckoId: "the-open-network",
    decimal: 9,
    mintBurn: true,
  },
  {
    chainId: "Oraichain",
    name: "Hamster Kombat",
    symbol: "HMSTR",
    Icon: HmstrIcon,
    contractAddress: null,
    denom: HMSTR_DENOM,
    coingeckoId: "hamster-kombat",
    decimal: 9,
    mintBurn: true,
  },
  ...(TonTokensContract[network as Environment.Mainnet]?.jUSDC
    ? [
        {
          chainId: "Oraichain",
          name: "USD Coin",
          symbol: "USDC",
          Icon: UsdcIcon,
          contractAddress: USDC_CONTRACT,
          denom: "usdc",
          coingeckoId: "usd-coin",
          decimal: 6,
        },
      ]
    : []),
  // ...(TonTokensContract[network as Environment.Staging]?.jUSDT
  //   ? [
  //       {
  //         chainId: "Oraichain",
  //         name: "Tether",
  //         symbol: "jUSDT",
  //         Icon: UsdtIcon,
  //         contractAddress: USDT_CONTRACT,
  //         denom: "jusdt",
  //         coingeckoId: "bridged-tether-ton-bridge",
  //         decimal: 6,
  //       },
  //     ]
  //   : []),
];

export const OsmosisTokenDenom = {
  [Environment.Mainnet]: {
    ton: "ibc/905889A7F0B94F1CE1506D9BADF13AE9141E4CBDBCD565E1DFC7AE418B3E3E98",
    allTon:
      "factory/osmo12lnwf54yd30p6amzaged2atln8k0l32n7ncxf04ctg7u7ymnsy7qkqgsw4/alloyed/allTON",
  },
  [Environment.Staging]: {
    ton: "ibc/64BF62F8C7C0B1AADBCFBCB45E778DA144E86804420AC5AD4F29D141A14A031B",
    alloyedTon: "", // not exist
  },
};

export const OsmosisTokenList = (network: Environment): TokenType[] => [
  {
    chainId: "osmosis-1",
    name: "Ton",
    symbol: "TON.orai",
    Icon: TonNetworkICon,
    contractAddress: null,
    denom: OsmosisTokenDenom[network].ton,
    coingeckoId: "the-open-network",
    decimal: 9,
  },
  {
    chainId: "osmosis-1",
    name: "Ton",
    symbol: "TON",
    Icon: TonNetworkICon,
    contractAddress: null,
    denom: OsmosisTokenDenom[network].allTon,
    coingeckoId: "the-open-network",
    decimal: 9,
    alloyedToken: true,
  },
];

export const TonTokenList = (network: Environment): TokenType[] => [
  {
    name: "Tether",
    symbol: "USDT",
    Icon: TetherIcon,
    contractAddress: TonTokensContract[network].usdt,
    denom: "ton20_tether",
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
  {
    name: "Hamster Kombat",
    symbol: "HMSTR",
    Icon: HmstrIcon,
    contractAddress: TonTokensContract[network].hmstr,
    denom: "ton20_hamster_kombat",
    coingeckoId: "hamster-kombat",
    decimal: 9,
  },
  ...(TonTokensContract[network as Environment.Mainnet]?.jUSDC
    ? [
        {
          name: "Jetton USDC",
          symbol: "jUSDC",
          Icon: UsdcIcon,
          contractAddress:
            TonTokensContract[network as Environment.Mainnet]?.jUSDC,
          denom: "ton20_usdc",
          coingeckoId: "usd-coin",
          decimal: 6,
        },
      ]
    : []),
  // ...(TonTokensContract[network as Environment.Staging]?.jUSDT
  //   ? [
  //       {
  //         name: "Jetton USDT",
  //         symbol: "jUSDT",
  //         Icon: UsdtIcon,
  //         contractAddress:
  //           TonTokensContract[network as Environment.Staging].jUSDT,
  //         denom: "ton20_usdt",
  //         coingeckoId: "bridged-tether-ton-bridge",
  //         decimal: 6,
  //       },
  //     ]
  //   : []),
];

export type AlloyedPool = {
  poolId: string;
  alloyedToken: string;
  sourceToken: string;
};

export const OsmosisAlloyedPools: AlloyedPool[] = [
  {
    poolId: "2161",
    alloyedToken:
      "factory/osmo12lnwf54yd30p6amzaged2atln8k0l32n7ncxf04ctg7u7ymnsy7qkqgsw4/alloyed/allTON",
    sourceToken:
      "ibc/905889A7F0B94F1CE1506D9BADF13AE9141E4CBDBCD565E1DFC7AE418B3E3E98",
  },
];

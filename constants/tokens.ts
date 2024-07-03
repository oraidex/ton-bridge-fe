import { UsdtIcon } from "@/assets/icons/token";
import { USDT_CONTRACT } from "@oraichain/oraidex-common";
import { TonNetwork, TonTokensContract } from "./networks";

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
  // {
  //   name: "Cosmos",
  //   symbol: "ATOM",
  //   Icon: AtomIcon,
  //   contractAddress: "",
  //   denom: "cosmos",
  // },
  // {
  //   name: "Ethereum",
  //   symbol: "ETH",
  //   Icon: EthIcon,
  //   contractAddress: "",
  //   denom: "eth",
  // },
  // {
  //   name: "Bitcoin",
  //   symbol: "BTC",
  //   Icon: BtcIcon,
  //   contractAddress: "",
  //   denom: "btc",
  // },
  // {
  //   name: "Oraichain",
  //   symbol: "ORAI",
  //   Icon: OraiIcon,
  //   contractAddress: "",
  //   denom: "orai",
  // },
];

export const TonTokenList = [
  {
    name: "Tether",
    symbol: "USDT",
    Icon: UsdtIcon,
    contractAddress: TonTokensContract[TonNetwork.Mainnet].usdt,
    denom: "ton20_usdt",
    coingeckoId: "tether",
    decimal: 6,
  },
  // {
  //   name: "Cosmos",
  //   symbol: "ATOM",
  //   Icon: AtomIcon,
  //   contractAddress: "",
  //   denom: "cosmos",
  // },
  // {
  //   name: "Ethereum",
  //   symbol: "ETH",
  //   Icon: EthIcon,
  //   contractAddress: "",
  //   denom: "eth",
  // },
  // {
  //   name: "Bitcoin",
  //   symbol: "BTC",
  //   Icon: BtcIcon,
  //   contractAddress: "",
  //   denom: "btc",
  // },
  // {
  //   name: "Oraichain",
  //   symbol: "ORAI",
  //   Icon: OraiIcon,
  //   contractAddress: "",
  //   denom: "orai",
  // },
];

import {
  MULTICALL_CONTRACT,
  ORACLE_CONTRACT,
  ROUTER_V2_CONTRACT,
} from "@oraichain/oraidex-common";
import { oraichainNetwork } from "./chainInfo";

export enum TonNetwork {
  Mainnet = "mainnet",
  Testnet = "testnet",
}

export const TonInteractionContract = {
  [TonNetwork.Mainnet]: {
    lightClient: "EQCkkxPb0X4DAMBrOi8Tyf0wdqqVtTR9ekbDqB9ijP391nQh",
    whitelist: "EQATDM6mfPZjPDMD9TVa6D9dlbmAKY5w6xOJiTXJ9Nqj_dsu",
    bridgeAdapter: "EQBy38YFj_k18VCeFYElCppp_lzS8fc26qZ_XvEwKUBQbe17",
  },
  [TonNetwork.Testnet]: {
    lightClient: "",
    whitelist: "EQD2xPIqdeggqtP3q852Y-7yD-RRHi12Zy7M4iUx4-7q0E1",
    bridgeAdapter: "EQDZfQX89gMo3HAiW1tSK9visb2gouUvDCt6PODo3qkXKeox",
  },
};

export const TonTokensContract = {
  [TonNetwork.Mainnet]: {
    usdt: "EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA",
    // btc: "EQDcBkGHmC4pTf34x3Gm05XvepO5w60DNxZ-XT4I6-UGG5L5",
    // dai: "EQDo_ZJyQ_YqBzBwbVpMmhbhIddKtRP99HugZJ14aFscxi7B",
    usdc: "EQB-MPwrd1G6WKNkLz_VnV6WqBDd142KMQv-g1O-8QUA3728",
  },
  [TonNetwork.Testnet]: {
    usdt: "EQA5FnPP13uZPJQq7aj6UHLEukJJZSZW053cU1Wu6R6BpYYB",
    // btc: "",
    // dai: "",
    usdc: "",
  },
};

export const network = {
  ...oraichainNetwork,
  prefix: oraichainNetwork.bech32Config.bech32PrefixAccAddr,
  denom: "orai",
  coinType: oraichainNetwork.bip44.coinType,
  fee: { gasPrice: "0.00506", amount: "1518", gas: "2000000" }, // 0.000500 ORAI
  router: ROUTER_V2_CONTRACT,
  oracle: ORACLE_CONTRACT,
  multicall: MULTICALL_CONTRACT,
  explorer: "https://scan.orai.io",
  CW_TON_BRIDGE:
    "orai1y4kj224wmzmrna4kz9nk3n00zxdst5nra0z0u0nry5k6seqdw5psu4t9fn",
};

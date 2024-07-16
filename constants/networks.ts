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
    lightClient: "EQDt5RAUICxUeHaNicwspH8obI__z3X0UHy6vv1xhpi3AbfT",
    whitelist: "EQATDM6mfPZjPDMD9TVa6D9dlbmAKY5w6xOJiTXJ9Nqj_dsu",
    bridgeAdapter: "EQArWlaBgdGClwJrAkQjQP_8zxIK_bdgbH-6qdl4f5JEfo3r",
  },
  [TonNetwork.Testnet]: {
    lightClient: "",
    whitelist: "EQD2xPIqdeggqtP3q852Y-7yD-RRHi12Zy7M4iUx4-7q0E1",
    bridgeAdapter: "EQDZfQX89gMo3HAiW1tSK9visb2gouUvDCt6PODo3qkXKeox",
  },
};

export const TON_ADDRESS_CONTRACT =
  "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";

export const TonTokensContract = {
  [TonNetwork.Mainnet]: {
    usdt: "EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA",
    // btc: "EQDcBkGHmC4pTf34x3Gm05XvepO5w60DNxZ-XT4I6-UGG5L5",
    // dai: "EQDo_ZJyQ_YqBzBwbVpMmhbhIddKtRP99HugZJ14aFscxi7B",
    usdc: "EQB-MPwrd1G6WKNkLz_VnV6WqBDd142KMQv-g1O-8QUA3728",
    ton: TON_ADDRESS_CONTRACT,
  },
  [TonNetwork.Testnet]: {
    usdt: "EQA5FnPP13uZPJQq7aj6UHLEukJJZSZW053cU1Wu6R6BpYYB",
    // btc: "",
    // dai: "",
    usdc: "",
    ton: null,
  },
};

export const CW20_TON_CONTRACT =
  "orai1v5msmzjhyrf0285fyhfwg7uxk4yzdhrn6srvf8jf27dz8uuvu3mstj78qt";

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
    "orai18lppnh7nwfnstpsewe70aql2qnmnm6kwkdcfe3j84ujtwzn89afqjp4pyr",
};

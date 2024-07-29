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
    bridgeAdapter: "EQASlo5_ZTuknZ5oZkM7RmPXN2oNOKk3usg4NMYBDf2VsTwk",
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
    usdt: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
    ton: TON_ADDRESS_CONTRACT,
  },
  [TonNetwork.Testnet]: {
    usdt: "EQA5FnPP13uZPJQq7aj6UHLEukJJZSZW053cU1Wu6R6BpYYB",
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
    "orai159l8l9c5ckhqpuwdfgs9p4v599nqt3cjlfahalmtrhfuncnec2ms5mz60e",
  TOKEN_FACTORY:
    "orai17hyr3eg92fv34fdnkend48scu32hn26gqxw3hnwkfy904lk9r09qqzty42",
};

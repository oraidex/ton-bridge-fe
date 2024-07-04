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
    lightClient: "EQCSnxYiqpz1hiOw76klvQfPCxalze9SoGTB8ZrVDhatdYjN",
    whitelist: "EQATDM6mfPZjPDMD9TVa6D9dlbmAKY5w6xOJiTXJ9Nqj_dsu",
    bridgeAdapter: "EQAwHLrVuAOgcA1x53KDXxyAL5ETqQFaAa7tT0wIi7UOrkNS",
  },
  [TonNetwork.Testnet]: {
    lightClient: "",
    whitelist: "EQD2xPIqdeggqtP3q852Y-7yD-RRHi12Zy7M4iUx4-7q0E1",
    bridgeAdapter: "EQDZfQX89gMo3HAiW1tSK9visb2gouUvDCt6PODo3qkXKeox",
  },
};

export const TonTokensContract = {
  [TonNetwork.Mainnet]: {
    usdt: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
  },
  [TonNetwork.Testnet]: {
    usdt: "EQA5FnPP13uZPJQq7aj6UHLEukJJZSZW053cU1Wu6R6BpYYB",
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

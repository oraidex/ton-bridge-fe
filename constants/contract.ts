import { TonNetwork } from "./ton";

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

export const TON_ZERO_ADDRESS =
  "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";

export const TonTokensContract = {
  [TonNetwork.Mainnet]: {
    usdt: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
    ton: TON_ZERO_ADDRESS,
  },
  [TonNetwork.Testnet]: {
    usdt: "EQA5FnPP13uZPJQq7aj6UHLEukJJZSZW053cU1Wu6R6BpYYB",
    ton: TON_ZERO_ADDRESS,
  },
};

export const CW_TON_BRIDGE =
  "orai1f8yer2astssamnyzzp6yvk6q5h49kzj2gu0n7rct8uj38pswy7lqwa8mdw";
export const TOKEN_FACTORY =
  "orai17hyr3eg92fv34fdnkend48scu32hn26gqxw3hnwkfy904lk9r09qqzty42";

import { Environment } from "./ton";

export const TON_ZERO_ADDRESS =
  "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";

export const TonInteractionContract = {
  [Environment.Mainnet]: {
    lightClient: "EQDzy_POlimFDyzrHd3OQsb9sZCngyG3O7Za4GRFzM-rrO93",
    whitelist: "EQATDM6mfPZjPDMD9TVa6D9dlbmAKY5w6xOJiTXJ9Nqj_dsu",
    bridgeAdapter: "EQC-aFP0rJXwTgKZQJPbPfTSpBFc8wxOgKHWD9cPvOl_DnaY",
  },
  [Environment.Staging]: {
    lightClient: "EQDzy_POlimFDyzrHd3OQsb9sZCngyG3O7Za4GRFzM-rrO93",
    whitelist: "EQAbJI3NZKGcVu-ec_z_LcmXca9ZOtzkgCW5H9glnWBDpaFg",
    bridgeAdapter: "EQA3ISho4fpW3wmCkKEwsyXulIw7vLf-2jxso40ul3QQJ_O7",
  },
  [Environment.Testnet]: {
    lightClient: "",
    whitelist: "",
    bridgeAdapter: "",
  },
};

export const TonTokensContract = {
  [Environment.Mainnet]: {
    usdt: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
    jUSDC: "EQB-MPwrd1G6WKNkLz_VnV6WqBDd142KMQv-g1O-8QUA3728",
    // jUSDT: "EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA",
    ton: TON_ZERO_ADDRESS,
  },
  [Environment.Staging]: {
    usdt: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
    jUSDT: "EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA",
    ton: TON_ZERO_ADDRESS,
  },
  [Environment.Testnet]: {
    usdt: "",
    ton: "",
  },
};

export const CwInteractionContract = {
  [Environment.Mainnet]: {
    cosmwasmBridge:
      "orai159l8l9c5ckhqpuwdfgs9p4v599nqt3cjlfahalmtrhfuncnec2ms5mz60e",
    tokenFactory:
      "orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9",
  },
  [Environment.Staging]: {
    cosmwasmBridge:
      "orai16e976su89dygmapmepqerktwj3zvx5znahnj0zpgwj2scef2sjask4vm58",
    tokenFactory:
      "orai17hyr3eg92fv34fdnkend48scu32hn26gqxw3hnwkfy904lk9r09qqzty42",
  },
};

export const CW_TON_BRIDGE =
  "orai159l8l9c5ckhqpuwdfgs9p4v599nqt3cjlfahalmtrhfuncnec2ms5mz60e";
export const TOKEN_FACTORY =
  "orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9";

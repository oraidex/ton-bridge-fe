import {
  MULTICALL_CONTRACT,
  ORACLE_CONTRACT,
  ROUTER_V2_CONTRACT,
} from "@oraichain/oraidex-common";
import { oraichainNetwork } from "./chainInfo";
import { CwInteractionContract } from "./contract";
import { Environment } from "./ton";

export const getNetworkConfig = (env: Environment = Environment.Mainnet) => {
  return {
    ...oraichainNetwork,
    prefix: oraichainNetwork.bech32Config.bech32PrefixAccAddr,
    denom: "orai",
    coinType: oraichainNetwork.bip44.coinType,
    fee: { gasPrice: "0.00506", amount: "1518", gas: "2000000" }, // 0.000500 ORAI
    explorer: "https://scan.orai.io",
    router: ROUTER_V2_CONTRACT,
    oracle: ORACLE_CONTRACT,
    multicall: MULTICALL_CONTRACT,
    CW_TON_BRIDGE: CwInteractionContract[env].cosmwasmBridge,
    TOKEN_FACTORY: CwInteractionContract[env].tokenFactory,
  };
};

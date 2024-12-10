import { toNano } from "@ton/core";

const FWD_AMOUNT = toNano(0.15);
const BRIDGE_TON_TO_ORAI_MINIMUM_GAS = 50000001n;
const BRIDGE_JETTON_TO_ORAI_MINIMUM_GAS = toNano(1);
const EXTERNAL_MESSAGE_FEE = toNano(0.01);
const MINIMUM_BRIDGE_PER_USD = 10;

export {
  FWD_AMOUNT,
  BRIDGE_TON_TO_ORAI_MINIMUM_GAS,
  BRIDGE_JETTON_TO_ORAI_MINIMUM_GAS,
  EXTERNAL_MESSAGE_FEE,
  MINIMUM_BRIDGE_PER_USD,
};

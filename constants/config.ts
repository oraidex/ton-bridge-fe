import { Address, Cell, toNano } from "@ton/core";

export interface SendTransferInterface {
  toAddress: Address;
  fwdAmount: bigint;
  jettonAmount: bigint;
  jettonMaster: Address;
  timeout: bigint;
  memo: Cell;
}

export const SEND_TON_TRANFERS_CONFIG: Partial<SendTransferInterface> = {
  fwdAmount: toNano(0.95),
  timeout: BigInt(Math.floor(new Date().getTime() / 1000) + 3600),
};

export const TON_SCAN = "https://tonviewer.com";
export const MANIFEST_URL = "https://ton.thesis.io/manifest.json";

export const ARG_BRIDGE_TO_TON = {
  CHANNEL: "channel-0",
  CRC_SRC: 3724195509,
};

export const AMOUNT_BALANCE_ENTRIES_UNIVERSAL_SWAP: [number, string, string][] =
  [
    [0.5, "50%", "half"],
    [1, "100%", "max"],
  ];

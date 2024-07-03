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

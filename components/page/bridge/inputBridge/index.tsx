"use client";

import useOnClickOutside from "@/hooks/useOnclickOutside";
import {
  useAuthOraiAddress,
  useAuthTonAddress,
} from "@/stores/authentication/selector";
import { FC, useRef, useState } from "react";
import styles from "./index.module.scss";
import ConnectButton from "@/components/layout/connectButton";
import SelectCommon from "@/components/commons/select";
import { SelectOptionIcon } from "@/assets/icons/network";
import {
  AtomIcon,
  BtcIcon,
  EthIcon,
  OraiIcon,
  UsdtIcon,
} from "@/assets/icons/token";
import { ArrowDownIcon } from "@/assets/icons/arrow";
import NumberFormat from "react-number-format";

export type NetworkType = "Oraichain" | "Ton";

const InputBridge: FC<{
  networkTo: NetworkType;
  disabled?: boolean;
  onChangeAmount?: (amount: number | undefined) => void;
  amount: number;
}> = ({
  networkTo = "Oraichain",
  disabled = false,
  amount,
  onChangeAmount,
}) => {
  const oraiAddress = useAuthOraiAddress();
  const tonAddress = useAuthTonAddress();
  const ref = useRef();

  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(null);

  useOnClickOutside(ref, () => setOpen(false));

  return (
    <div className={styles.inputBridge}>
      <div className={styles.header}></div>
      <div className={styles.content}>
        <SelectCommon
          open={open}
          onClose={() => setOpen(false)}
          title="Select a token"
          triggerElm={
            <div className={styles.token}>
              {!token ? (
                <div>
                  <SelectOptionIcon />
                  Select token
                </div>
              ) : (
                <div>
                  <token.Icon />
                  {token.symbol}
                </div>
              )}
              <ArrowDownIcon />
            </div>
          }
        >
          <div className={styles.list}>
            {(networkTo === "Oraichain"
              ? OraichainTokenList
              : TonTokenList
            ).map((e, key) => {
              return (
                <div className={styles.tokenItem} key={`token-${key}`}>
                  <e.Icon />
                  <div className={styles.info}>
                    <p>{e.symbol}</p>
                    <p className={styles.name}>{e.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </SelectCommon>

        <NumberFormat
          placeholder="0"
          thousandSeparator
          className={styles.input}
          decimalScale={6}
          disabled={disabled}
          type="text"
          value={amount}
          onChange={() => {}}
          isAllowed={(values) => {
            const { floatValue } = values;
            // allow !floatValue to let user can clear their input
            return !floatValue || (floatValue >= 0 && floatValue <= 1e14);
          }}
          onValueChange={({ floatValue }) => {
            onChangeAmount && onChangeAmount(floatValue);
          }}
        />
      </div>
    </div>
  );
};

export default InputBridge;

export const OraichainTokenList = [
  {
    name: "Tether",
    symbol: "USDT",
    Icon: UsdtIcon,
    contractAddress: "",
    denom: "usdt",
  },
  {
    name: "Cosmos",
    symbol: "ATOM",
    Icon: AtomIcon,
    contractAddress: "",
    denom: "cosmos",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    Icon: EthIcon,
    contractAddress: "",
    denom: "eth",
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    Icon: BtcIcon,
    contractAddress: "",
    denom: "btc",
  },
  {
    name: "Oraichain",
    symbol: "ORAI",
    Icon: OraiIcon,
    contractAddress: "",
    denom: "orai",
  },
];

export const TonTokenList = [
  {
    name: "Tether",
    symbol: "USDT",
    Icon: UsdtIcon,
    contractAddress: "",
    denom: "usdt",
  },
  {
    name: "Cosmos",
    symbol: "ATOM",
    Icon: AtomIcon,
    contractAddress: "",
    denom: "cosmos",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    Icon: EthIcon,
    contractAddress: "",
    denom: "eth",
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    Icon: BtcIcon,
    contractAddress: "",
    denom: "btc",
  },
  {
    name: "Oraichain",
    symbol: "ORAI",
    Icon: OraiIcon,
    contractAddress: "",
    denom: "orai",
  },
];

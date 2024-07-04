"use client";

import { SearchIcon } from "@/assets/icons/action";
import { ArrowDownIcon } from "@/assets/icons/arrow";
import { SelectOptionIcon } from "@/assets/icons/network";
import SelectCommon from "@/components/commons/select";
import { OraichainTokenList, TonTokenList } from "@/constants/tokens";
import useOnClickOutside from "@/hooks/useOnclickOutside";
import {
  useAuthOraiAddress,
  useAuthTonAddress,
} from "@/stores/authentication/selector";
import { Dispatch, FC, useRef, useState } from "react";
import NumberFormat from "react-number-format";
import styles from "./index.module.scss";
import { useAmountsCache } from "@/stores/token/selector";
import { BigDecimal, toDisplay } from "@oraichain/oraidex-common";
import { useCoinGeckoPrices } from "@/hooks/useCoingecko";
import { numberWithCommas } from "@/helper/number";
import { TonNetwork } from "@/constants/networks";

export type NetworkType = "Oraichain" | "Ton";

const InputBridge: FC<{
  networkTo?: NetworkType;
  disabled?: boolean;
  onChangeAmount?: (amount: number | undefined) => void;
  amount: number;
  balance: bigint;
  token: any;
  tonNetwork: TonNetwork;
  setToken: Dispatch<any>;
}> = ({
  networkTo = "Oraichain",
  disabled = false,
  amount,
  onChangeAmount,
  balance,
  token,
  tonNetwork,
  setToken,
}) => {
  const amounts = useAmountsCache();

  const ref = useRef();

  const [txtSearch, setTxtSearch] = useState<string>();
  const [open, setOpen] = useState(false);
  // const [token, setToken] = useState(null);
  const { data: prices } = useCoinGeckoPrices();

  useOnClickOutside(ref, () => setOpen(false));

  const usdPrice = new BigDecimal(amount || 0)
    .mul(prices?.[token?.coingeckoId] || 0)
    .toNumber();

  const displayBalance =
    networkTo === "Ton"
      ? toDisplay(amounts?.[token?.denom] || "0", token?.decimal)
      : balance;

  return (
    <div className={styles.inputBridge}>
      <div className={styles.header}>
        <span className={styles.bal}>Balance:</span> {balance}
        {networkTo != "Oraichain"
          ? toDisplay(amounts[token?.denom], token?.decimal)
          : toDisplay(balance, 6)}{" "}
        {token?.symbol}
      </div>
      <div className={styles.content}>
        <SelectCommon
          open={open}
          onClose={() => setOpen(false)}
          title="Select a token"
          triggerElm={
            <div className={styles.token} onClick={() => setOpen(true)}>
              {!token ? (
                <div className={styles.info}>
                  <SelectOptionIcon />
                  Select token
                </div>
              ) : (
                <div className={styles.info}>
                  <token.Icon />
                  {token.symbol}
                </div>
              )}
              <ArrowDownIcon />
            </div>
          }
        >
          <div className={styles.search}>
            <SearchIcon className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              value={txtSearch}
              onChange={(e) => setTxtSearch(e.target.value)}
              placeholder="Search by address, asset, type"
            />
          </div>

          <div className={styles.list}>
            {(networkTo === "Ton"
              ? OraichainTokenList
              : TonTokenList(tonNetwork)
            ).map((e, key) => {
              return (
                <div
                  className={styles.tokenItem}
                  key={`token-${key}`}
                  onClick={() => {
                    setToken(e);
                    setOpen(false);
                  }}
                >
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

        <div className={styles.inputWrapper}>
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

          <span className={styles.suffix}>
            ≈ $
            {numberWithCommas(usdPrice, undefined, {
              maximumFractionDigits: 6,
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InputBridge;

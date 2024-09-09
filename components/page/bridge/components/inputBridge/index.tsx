"use client";

import { SearchIcon } from "@/assets/icons/action";
import { ArrowDownIcon } from "@/assets/icons/arrow";
import { SelectOptionIcon } from "@/assets/icons/network";
import SelectCommon from "@/components/commons/select";
import { AMOUNT_BALANCE_ENTRIES_UNIVERSAL_SWAP } from "@/constants/config";
import { Environment } from "@/constants/ton";
import {
  OraichainTokenList,
  OsmosisTokenList,
  TonTokenList,
} from "@/constants/tokens";
import { numberWithCommas } from "@/helper/number";
import { useCoinGeckoPrices } from "@/hooks/useCoingecko";
import useOnClickOutside from "@/hooks/useOnclickOutside";
import { useAmountsCache, useTonAmountsCache } from "@/stores/token/selector";
import {
  BigDecimal,
  CW20_DECIMALS,
  toDisplay,
} from "@oraichain/oraidex-common";
import classNames from "classnames";
import { Dispatch, FC, SetStateAction, useRef, useState } from "react";
import NumberFormat from "react-number-format";
import { fromNano } from "@ton/core";
import styles from "./index.module.scss";
import { EXTERNAL_MESSAGE_FEE } from "../../constants";
import { NetworkList } from "../..";

export type NetworkType = "Oraichain" | "Ton" | "osmosis-1";

const InputBridge: FC<{
  networkTo?: NetworkType;
  networkFrom?: NetworkType;
  disabled?: boolean;
  onChangeAmount?: (amount: number | undefined) => void;
  amount: number;
  token: any;
  tonNetwork: Environment;
  setToken: Dispatch<any>;
  txtSearch: string;
  setTxtSearch: Dispatch<SetStateAction<string>>;
  deductNativeAmount: bigint;
  isMaintained?: boolean;
}> = ({
  networkTo = "Oraichain",
  networkFrom = "",
  disabled = false,
  amount,
  onChangeAmount,
  token,
  tonNetwork,
  setToken,
  txtSearch,
  setTxtSearch,
  deductNativeAmount,
  isMaintained = false,
}) => {
  const amounts = useAmountsCache();
  const amountsTon = useTonAmountsCache();

  const ref = useRef();

  const [open, setOpen] = useState(false);
  const [coe, setCoe] = useState(0);
  const { data: prices } = useCoinGeckoPrices();

  useOnClickOutside(ref, () => setOpen(false));

  const usdPrice = new BigDecimal(amount || 0)
    .mul(prices?.[token?.coingeckoId] || 0)
    .toNumber();

  let displayBalance = toDisplay(
    amountsTon?.[token?.denom] || "0",
    token?.decimal
  );

  if (
    networkFrom === NetworkList.oraichain.id ||
    networkFrom === NetworkList["osmosis-1"].id
  ) {
    displayBalance = toDisplay(amounts?.[token?.denom] || "0", token?.decimal);
  }

  function filterByCoingeckoId(tokenList, coingeckoId = "the-open-network") {
    return tokenList.filter((token) => token.coingeckoId === coingeckoId);
  }

  let networkList = TonTokenList(tonNetwork);
  if (networkTo === NetworkList.ton.id)
    networkList = OraichainTokenList(tonNetwork);
  if (networkTo === NetworkList["osmosis-1"].id) {
    const tokenList =
      networkFrom === NetworkList.oraichain.id
        ? OraichainTokenList(tonNetwork)
        : TonTokenList(tonNetwork);
    networkList = filterByCoingeckoId(tokenList);
  }

  if (networkFrom === NetworkList["osmosis-1"].id)
    networkList = OsmosisTokenList(tonNetwork);

  return (
    <div
      className={classNames(styles.inputBridge, {
        [styles.isMaintained]: isMaintained,
      })}
    >
      <div className={styles.header}>
        <div className={styles.headerTxt}>
          <span className={styles.bal}>Balance: </span>
          {!token
            ? "--"
            : numberWithCommas(displayBalance, undefined, {
                maximumFractionDigits: CW20_DECIMALS,
              })}{" "}
          {token?.symbol}
        </div>
        <div className={styles.percentWrapper}>
          {AMOUNT_BALANCE_ENTRIES_UNIVERSAL_SWAP.map(([coeff, text]) => {
            return (
              <button
                disabled={!token}
                key={coeff}
                className={classNames(styles.percent, {
                  activePercent: coe === coeff,
                })}
                onClick={(event) => {
                  event.stopPropagation();
                  const formattedDeductNativeAmount =
                    fromNano(deductNativeAmount);

                  // @dev: if choose 100% then minus with fee for execute ton tx
                  const amount = new BigDecimal(coeff)
                    .mul(displayBalance)
                    .sub(coeff == 1 ? formattedDeductNativeAmount : 0n)
                    .sub(
                      deductNativeAmount > 0n
                        ? fromNano(EXTERNAL_MESSAGE_FEE)
                        : 0n
                    )
                    .toNumber();

                  const foreseeBalance = new BigDecimal(displayBalance)
                    .sub(formattedDeductNativeAmount)
                    .sub(amount)
                    .toNumber();

                  onChangeAmount &&
                    // @dev: still need to validate whether amount > display balance
                    onChangeAmount(
                      foreseeBalance >= 0 && amount >= 0 ? amount : 0
                    );
                  setCoe(coeff);
                }}
              >
                {text}
              </button>
            );
          })}
        </div>
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
              placeholder="Search by address, asset"
            />
          </div>

          <div className={styles.list}>
            {networkList
              .filter(
                (e) =>
                  !txtSearch ||
                  (txtSearch &&
                    (e.denom.toLowerCase().includes(txtSearch.toLowerCase()) ||
                      (e.contractAddress || "")
                        .toLowerCase()
                        .includes(txtSearch.toLowerCase())))
              )
              .map((e, key) => {
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
            disabled={disabled || isMaintained}
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

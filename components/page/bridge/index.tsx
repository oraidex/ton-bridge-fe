"use client";

import useOnClickOutside from "@/hooks/useOnclickOutside";
import {
  useAuthOraiAddress,
  useAuthTonAddress,
} from "@/stores/authentication/selector";
import { useRef, useState } from "react";
import styles from "./index.module.scss";
import ConnectButton from "@/components/layout/connectButton";
import InputBridge from "./inputBridge";

const Bridge = () => {
  const oraiAddress = useAuthOraiAddress();
  const tonAddress = useAuthTonAddress();
  const ref = useRef();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(tonAddress ? 2 : 1);

  useOnClickOutside(ref, () => setOpen(false));

  return (
    <div className={styles.swapWrapper}>
      <div className={styles.header}>TON Bridge</div>

      <div className={styles.content}>
        <div className={styles.divider}></div>
        <div className={styles.handler}>
          <div className={styles.select}></div>
          <div className={styles.input}>
            <InputBridge />
          </div>
          <div className={styles.destination}>
            <p>Destination address</p>
            <p className={styles.addressTo}>{oraiAddress || ""}</p>
          </div>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.est}>
          <div className={styles.itemEst}>
            <span>Ethereum gas fee</span>
            <span className={styles.value}>~ 0.0017 ETH</span>
          </div>
          <div className={styles.itemEst}>
            <span>Bridge fee</span>
            <span className={styles.value}>1 TON</span>
          </div>
        </div>

        <div className={styles.button}>
          {oraiAddress && tonAddress ? (
            <button className={styles.bridgeBtn}>Bridge</button>
          ) : (
            <ConnectButton fullWidth />
          )}
        </div>
      </div>
    </div>
  );
};

export default Bridge;

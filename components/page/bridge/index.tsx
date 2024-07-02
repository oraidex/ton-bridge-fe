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
import { SwapIcon } from "@/assets/icons/action";
import { TonNetworkICon } from "@/assets/icons/network";
import { OraiIcon } from "@/assets/icons/token";

const Bridge = () => {
  const oraiAddress = useAuthOraiAddress();
  const tonAddress = useAuthTonAddress();

  const [amount, setAmount] = useState(null);
  const [fromNetwork, setFromNetwork] = useState(NetworkList.ton);
  const [toNetwork, setToNetwork] = useState(NetworkList.oraichain);

  return (
    <div className={styles.swapWrapper}>
      <div className={styles.header}>TON Bridge</div>

      <div className={styles.content}>
        <div className={styles.divider}></div>
        <div className={styles.handler}>
          <div className={styles.select}>
            <div className={styles.fromTo}>
              <h2>From</h2>
              <div className={styles.networkItem}>
                <fromNetwork.Icon />
                {fromNetwork.name}
              </div>
            </div>
            <SwapIcon
              className={styles.switch}
              onClick={() => {
                const [currentTo, currentFrom] = [toNetwork, fromNetwork];
                setFromNetwork(currentTo);
                setToNetwork(currentFrom);
              }}
            />
            <div className={styles.fromTo}>
              <h2>To</h2>
              <div className={styles.networkItem}>
                <toNetwork.Icon />
                {toNetwork.name}
              </div>
            </div>
          </div>
          <div className={styles.input}>
            <InputBridge
              amount={amount}
              onChangeAmount={(val) => setAmount(val)}
            />
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
          {/* <button className={styles.bridgeBtn}>Bridge</button> */}
        </div>
      </div>
    </div>
  );
};

export default Bridge;

export const NetworkList = {
  ton: {
    name: "TON",
    id: "TON",
    Icon: TonNetworkICon,
  },
  oraichain: {
    name: "Oraichain",
    id: "Oraichain",
    Icon: OraiIcon,
  },
};

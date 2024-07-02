"use client";

import { OraiDEXLogo } from "@/assets/icons/OraiDEXLogo";
import styles from "./index.module.scss";
import ConnectButton from "../connectButton";
import { TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";

const Header = () => {
  const [tonConnectUi] = useTonConnectUI();
  return (
    <div className={styles.header}>
      <OraiDEXLogo />

      {/* <div className={styles.button}>Connect Wallet</div> */}

      {/* <button
        className={styles.button}
        onClick={() => {
          console.log("connect");

          tonConnectUi.openModal();
        }}
      >
        Connect wallet
      </button> */}
      {/* <TonConnectButton /> */}
      <ConnectButton />
    </div>
  );
};

export default Header;

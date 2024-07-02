"use client";

import { CopyIcon } from "@/assets/icons/action";
import {
  KeplrIcon,
  MetamaskIcon,
  MyTonWalletIcon,
  OwalletIcon,
  TonKeeperIcon,
} from "@/assets/icons/wallet";
import { reduceString } from "@/libs/utils";
import {
  useAuthOraiAddress,
  useAuthOraiWallet,
  useAuthTonAddress,
  useAuthTonWallet,
  useAuthenticationActions,
} from "@/stores/authentication/selector";
import {
  OraiWallet,
  TonWallet,
} from "@/stores/authentication/useAuthenticationStore";
import { FC, useRef, useState } from "react";
import styles from "./index.module.scss";

const ConnectedInfo: FC<{ onClick: () => void }> = ({ onClick }) => {
  const oraiAddress = useAuthOraiAddress();
  const oraiWallet = useAuthOraiWallet();
  const tonAddress = useAuthTonAddress();
  const tonWallet = useAuthTonWallet();
  const ref = useRef();
  const {
    handleSetOraiAddress,
    handleSetOraiWallet,
    handleSetTonAddress,
    handleSetTonWallet,
  } = useAuthenticationActions();
  const [copiedValue, setCopiedValue] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setCopiedValue(text);
      })
      .catch((error) => {
        console.error("Failed to copy to clipboard", error);
        setCopiedValue(null);
      });
  };

  const OraichainWalet = mapWalletToIcon[oraiWallet];
  const TonNetworkIcon = mapWalletToIcon[tonWallet];

  return (
    <div className={styles.connectedInfo} onClick={() => onClick()}>
      <div className={styles.item}>
        {OraichainWalet && <OraichainWalet />}
        {reduceString(oraiAddress, 6, 6)}
        <CopyIcon
          className={styles.copy}
          onClick={(e) => {
            e.stopPropagation();
            handleCopy(oraiAddress);
          }}
        />
      </div>
      <div className={styles.item}>
        {TonNetworkIcon && <TonNetworkIcon />}
        {reduceString(tonAddress, 6, 6)}
        <CopyIcon
          className={styles.copy}
          onClick={(e) => {
            e.stopPropagation();
            handleCopy(tonAddress);
          }}
        />
      </div>
    </div>
  );
};

export default ConnectedInfo;

const mapWalletToIcon = {
  [OraiWallet.Keplr]: KeplrIcon,
  [OraiWallet.OWallet]: OwalletIcon,
  [OraiWallet.Metamask]: MetamaskIcon,
  [TonWallet.TonKeeper]: TonKeeperIcon,
  [TonWallet.MyTonWallet]: MyTonWalletIcon,
};

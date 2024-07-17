"use client";

import { CheckIcon, CopyIcon } from "@/assets/icons/action";
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
import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./index.module.scss";

const ConnectedInfo: FC<{
  onClick: () => void;
  setStep: Dispatch<SetStateAction<number>>;
}> = ({ onClick, setStep }) => {
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

  const OraichainWalet = mapWalletToIcon[oraiWallet];
  const TonNetworkIcon = mapWalletToIcon[tonWallet];

  return (
    <div className={styles.connectedInfo}>
      <div
        className={styles.item}
        onClick={() => {
          onClick();
          setStep(1);
        }}
      >
        {OraichainWalet && <OraichainWalet />}
        {reduceString(oraiAddress, 6, 6)}
        <CopyButton value={oraiAddress} />
      </div>
      <div
        className={styles.item}
        onClick={() => {
          onClick();
          setStep(2);
        }}
      >
        {TonNetworkIcon && <TonNetworkIcon />}
        {reduceString(tonAddress, 6, 6)}
        <CopyButton value={tonAddress} />
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

export const CopyButton = ({ value }: { value: string }) => {
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

  useEffect(() => {
    let timeoutId;

    if (isCopied) {
      timeoutId = setTimeout(() => {
        setIsCopied(false);
        setCopiedValue(null);
      }, 2000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isCopied]);

  return isCopied ? (
    <CheckIcon />
  ) : (
    <CopyIcon
      className={styles.copy}
      onClick={(e) => {
        e.stopPropagation();
        handleCopy(value);
      }}
    />
  );
};

"use client";

import { FC, useRef, useState } from "react";
import styles from "./index.module.scss";
import classNames from "classnames";
import { CloseIcon } from "@/assets/icons/action";
import { OraiIcon } from "@/assets/icons/token";
import { StepLineIcon } from "@/assets/icons/arrow";
import { TonNetworkICon } from "@/assets/icons/network";
import {
  KeplrIcon,
  MetamaskIcon,
  MyTonWalletIcon,
  OwalletIcon,
  TonKeeperIcon,
} from "@/assets/icons/wallet";
import {
  useAuthOraiAddress,
  useAuthTonAddress,
} from "@/stores/authentication/selector";
import {
  OraiWallet,
  TonWallet,
} from "@/stores/authentication/useAuthenticationStore";
import useOnClickOutside from "@/hooks/useOnclickOutside";

const ConnectButton: FC<{ fullWidth?: boolean }> = ({ fullWidth }) => {
  const oraiAddress = useAuthOraiAddress();
  const tonAddress = useAuthTonAddress();
  const ref = useRef();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(tonAddress ? 2 : 1);

  useOnClickOutside(ref, () => setOpen(false));

  return (
    <div
      className={classNames(styles.wrapperConnect, {
        [styles.fullWidth]: !!fullWidth,
      })}
    >
      <button className={styles.buttonConnect} onClick={() => setOpen(true)}>
        Connect Wallet
      </button>
      <div
        className={classNames(styles.modalConnectWrapper, {
          [styles.active]: open,
        })}
        // onClick={() => setOpen(false)}
      >
        <div className={styles.content} ref={ref}>
          <div className={styles.header}>
            <span>{step}/2</span>

            <CloseIcon
              onClick={() => setOpen(false)}
              className={styles.close}
            />
          </div>
          <div className={styles.wallet}>
            <div className={styles.left}>
              <h1>Connect to Wallets</h1>
              <p>
                You’ll need to connect both your Oraichain and <br /> TON
                wallets to get started
              </p>
              <div className={styles.step}>
                <div
                  className={classNames(styles.stepItem, styles.active)}
                  onClick={() => setStep(1)}
                >
                  <OraiIcon /> <span>ORAICHAIN</span>
                </div>
                <StepLineIcon />
                <div
                  className={classNames(styles.stepItem, {
                    [styles.active]: step !== 1,
                  })}
                  onClick={() => setStep(2)}
                >
                  <TonNetworkICon /> <span>TON</span>
                </div>
              </div>
            </div>
            <div className={styles.right}>
              {(step === 1 ? OraichainWallet : TonNetWorkWallet).map(
                (e, ind) => {
                  return (
                    <div key={`${e.id}-${ind}`} className={styles.walletItem}>
                      <e.icon />
                      <span>{e.name}</span>
                      <div className={styles.status}>Connect</div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectButton;

const OraichainWallet = [
  {
    icon: OwalletIcon,
    name: OraiWallet.OWallet,
    id: "Owallet",
  },
  {
    icon: MetamaskIcon,
    name: OraiWallet.Metamask,
    id: "Metamask",
  },
  {
    icon: KeplrIcon,
    name: OraiWallet.Keplr,
    id: "Keplr",
  },
];

const TonNetWorkWallet = [
  {
    icon: TonKeeperIcon,
    name: TonWallet.TonKeeper,
    id: "TonKeeper",
  },
  {
    icon: MyTonWalletIcon,
    name: TonWallet.MyTonWallet,
    id: "MyTonWallet",
  },
];

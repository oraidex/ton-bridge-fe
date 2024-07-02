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
  useAuthOraiWallet,
  useAuthTonAddress,
  useAuthTonWallet,
  useAuthenticationActions,
} from "@/stores/authentication/selector";
import {
  OraiWallet,
  TonWallet,
  WalletNetwork,
} from "@/stores/authentication/useAuthenticationStore";
import useOnClickOutside from "@/hooks/useOnclickOutside";
import { useInactiveConnect } from "@/hooks/useMetamask";
import { WalletType } from "@oraichain/oraidex-common";
import Keplr from "@/libs/keplr";
import { keplrCheck, setStorageKey } from "@/helper";
import { initClient } from "@/libs/utils";
import Loader from "@/components/commons/loader/Loader";
import { TToastType, displayToast } from "@/contexts/toasts/Toast";

export type ConnectStatus =
  | "init"
  | "confirming-switch"
  | "confirming-disconnect"
  | "loading"
  | "failed"
  | "success";

const ConnectButton: FC<{ fullWidth?: boolean }> = ({ fullWidth }) => {
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
  const [connectStatus, setConnectStatus] = useState<OraiWallet | "init">(
    "init"
  );

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(oraiAddress ? 2 : 1);

  useOnClickOutside(ref, () => setOpen(false));

  const connect = useInactiveConnect();

  // @ts-ignore
  const isCheckOwallet = window.owallet?.isOwallet;
  const version = window?.keplr?.version;
  const isCheckKeplr = !!version && keplrCheck("keplr");
  const isMetamask = window?.ethereum?.isMetaMask;
  //@ts-ignore
  const isTronLink = window?.tronWeb?.isTronLink;

  const handleConnectWalletInOraichainNetwork = async (
    walletType: OraiWallet // WalletType | "eip191"
  ) => {
    setConnectStatus(walletType);
    try {
      window.Keplr = new Keplr(walletType);
      setStorageKey("typeWallet", walletType);
      await initClient();
      const oraiAddr = await window.Keplr.getKeplrAddr();
      handleSetOraiAddress({ oraiAddress: oraiAddr });
      handleSetOraiWallet({ oraiWallet: walletType });
      setStep(2);
      displayToast(TToastType.TX_INFO, {
        message: `Connect to Oraichain successfully!`,
      });
    } catch (error) {
      console.trace({ errorCosmos: error });
      throw new Error(error?.message ?? JSON.stringify(error));
    } finally {
      setConnectStatus("init");
    }
  };

  const handleConnectWalletInTonNetwork = () => {
    setOpen(false);
  };

  const handleDisconnectOraichain = (walletType: OraiWallet) => {
    if (oraiAddress && walletType === oraiWallet) {
      handleSetOraiAddress({ oraiAddress: undefined }),
        handleSetOraiWallet({ oraiWallet: undefined });
    }
  };

  const handleDisconnectTon = (walletType: TonWallet) => {
    if (oraiAddress && walletType === tonWallet) {
      handleSetTonAddress({ tonAddress: undefined }),
        handleSetTonWallet({ tonWallet: undefined });
    }
  };

  const hasInstalledWallet = (wallet: OraiWallet | TonWallet) => {
    switch (wallet) {
      case OraiWallet.Keplr:
        return isCheckKeplr;
      case OraiWallet.Metamask:
        return isMetamask;
      case OraiWallet.OWallet:
        return isCheckOwallet;

      default:
        return false;
    }
  };

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
                  const isConnected =
                    (oraiAddress && oraiWallet === e.name) ||
                    (tonAddress && tonWallet === e.name);
                  const isNotInstall = !hasInstalledWallet(e.name);

                  return (
                    <button
                      disabled={isNotInstall}
                      key={`${e.id}-${ind}`}
                      className={classNames(styles.walletItem, {
                        [styles.notInstalled]: isNotInstall,
                      })}
                      title={
                        isNotInstall
                          ? `${e.name} is not installed!`
                          : `${e.name}`
                      }
                      onClick={() => {
                        if (isConnected) {
                          step === 1
                            ? handleDisconnectOraichain(e.name)
                            : handleDisconnectTon(e.name);

                          return;
                        }

                        if (step === 1) {
                          handleConnectWalletInOraichainNetwork(e.name);
                        } else {
                          console.log("connect Ton");
                        }
                      }}
                    >
                      <e.icon />
                      <span>{e.name}</span>
                      <div
                        className={classNames(styles.status, {
                          [styles.connected]: isConnected,
                        })}
                      >
                        {connectStatus === e.name && (
                          <Loader width={14} height={14} />
                        )}
                        {isConnected ? "Connected" : "Connect"}
                      </div>
                    </button>
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

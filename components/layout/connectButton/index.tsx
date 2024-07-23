"use client";

import { CloseIcon } from "@/assets/icons/action";
import { StepLineIcon } from "@/assets/icons/arrow";
import { TonNetworkICon } from "@/assets/icons/network";
import { OraiIcon } from "@/assets/icons/token";
import Loader from "@/components/commons/loader/Loader";
import { OraichainWallet, TonNetWorkWallet } from "@/constants/wallets";
import { TToastType, displayToast } from "@/contexts/toasts/Toast";
import { keplrCheck, setStorageKey } from "@/helper";
import useOnClickOutside from "@/hooks/useOnclickOutside";
import Keplr from "@/libs/keplr";
import { initClient } from "@/libs/utils";
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
import { useTokenActions } from "@/stores/token/selector";
import {
  useTonAddress,
  useTonConnectModal,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import classNames from "classnames";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import ConnectedInfo from "../connectedInfo";
import styles from "./index.module.scss";

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
  const { handleResetAmountsCache, handleResetTonAmountsCache } =
    useTokenActions();
  const [connectStatus, setConnectStatus] = useState<
    OraiWallet | TonWallet | "init"
  >("init");

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(oraiAddress ? 2 : 1);

  const userFriendlyAddress = useTonAddress();
  const wallet = useTonWallet();
  const { open: openConnect } = useTonConnectModal();
  const [tonConnectUI] = useTonConnectUI();

  useOnClickOutside(ref, () => setOpen(false));

  const handleConnectWalletInOraichainNetwork = async (
    walletType: OraiWallet // WalletType | "eip191"
  ) => {
    setConnectStatus(walletType);

    try {
      const isNotInstall = !hasInstalledWallet(walletType);
      console.log("isNotInstalled", isNotInstall);
      if (isNotInstall) {
        throw `${walletType} is not installed`;
      }

      window.Keplr = new Keplr(walletType);
      setStorageKey("typeWallet", walletType);
      await initClient();
      const oraiAddr = await window.Keplr.getKeplrAddr();
      handleSetOraiAddress({ oraiAddress: oraiAddr });
      handleSetOraiWallet({ oraiWallet: walletType });
      setStep(2);
    } catch (error) {
      console.log({ errorCosmos: error });
      displayToast;
      // throw new Error(error?.message ?? JSON.stringify(error));

      displayToast(TToastType.TX_FAILED, {
        message: error?.message ?? JSON.stringify(error),
      });
    } finally {
      setConnectStatus("init");
    }
  };

  const handleConnectWalletInTonNetwork = async (walletType: TonWallet) => {
    try {
      setConnectStatus(walletType);
      openConnect();

      return;
    } catch (error) {
      console.log("error connect", error);
    } finally {
      setConnectStatus("init");
    }
  };

  const handleDisconnectOraichain = (walletType: OraiWallet) => {
    if (oraiAddress && walletType === oraiWallet) {
      handleSetOraiAddress({ oraiAddress: undefined });
      handleSetOraiWallet({ oraiWallet: undefined });
      handleResetAmountsCache();
    }
  };

  const handleDisconnectTon = async (walletType: TonWallet) => {
    try {
      if (tonConnectUI.connected) {
        await tonConnectUI.disconnect();
      }

      if (tonAddress && walletType === tonWallet) {
        handleSetTonAddress({ tonAddress: undefined });
        handleSetTonWallet({ tonWallet: undefined });
        handleResetTonAmountsCache();
      }
    } catch (error) {
      console.log("error disconnect TON :>>", error);
    }
  };

  useEffect(() => {
    if (!(userFriendlyAddress && wallet)) {
      handleSetTonAddress({ tonAddress: undefined });
      handleSetTonWallet({ tonWallet: undefined });
      return;
    }
    console.log("userFriendlyAddress", userFriendlyAddress, wallet);

    handleSetTonAddress({ tonAddress: userFriendlyAddress });
    handleSetTonWallet({
      tonWallet:
        wallet?.["appName"] ||
        (wallet?.device?.appName?.toLowerCase() as TonWallet),
    });
  }, [userFriendlyAddress, wallet]);

  // @ts-ignore
  const isCheckOwallet =
    typeof window !== "undefined" && window?.owallet?.["isOwallet"];
  const version = typeof window !== "undefined" && window?.keplr?.version;
  const isCheckKeplr = !!version && keplrCheck("keplr");
  const isMetamask =
    typeof window !== "undefined" && window?.ethereum?.isMetaMask;

  const hasInstalledWallet = useCallback(
    (wallet: OraiWallet | TonWallet) => {
      if (typeof window === "undefined") {
        return true;
      }

      //@ts-ignore
      switch (wallet) {
        case OraiWallet.Keplr:
          return isCheckKeplr;
        case OraiWallet.Metamask:
          return isMetamask;
        case OraiWallet.OWallet:
          return isCheckOwallet;

        default:
          // case ton connect. for @ton-connect/ui-react handle
          return true;
      }
    },
    [isCheckOwallet, isCheckKeplr, isMetamask]
  );

  return (
    <div
      className={classNames(styles.wrapperConnect, {
        [styles.fullWidth]: !!fullWidth,
      })}
    >
      {!(oraiAddress && tonAddress) ? (
        <button className={styles.buttonConnect} onClick={() => setOpen(true)}>
          Connect Wallet
        </button>
      ) : (
        <ConnectedInfo onClick={() => setOpen(true)} setStep={setStep} />
      )}
      {open && (
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
                      (oraiAddress && oraiWallet === e.id) ||
                      (tonAddress && tonWallet === e.id); //connector.connected &&
                    const isNotInstall = !hasInstalledWallet(e.id);

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
                              ? handleDisconnectOraichain(e.id)
                              : handleDisconnectTon(e.id);

                            return;
                          }

                          if (step === 1) {
                            handleConnectWalletInOraichainNetwork(e.id);
                          } else {
                            console.log("connect Ton", e.id);
                            handleConnectWalletInTonNetwork(e.id);
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
                          {connectStatus === e.id && (
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
      )}
    </div>
  );
};

export default ConnectButton;

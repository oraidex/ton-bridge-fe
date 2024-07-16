"use client";

import { CloseIcon } from "@/assets/icons/action";
import { StepLineIcon } from "@/assets/icons/arrow";
import { TonNetworkICon } from "@/assets/icons/network";
import { OraiIcon } from "@/assets/icons/token";
import Loader from "@/components/commons/loader/Loader";
import { OraichainWallet, TonNetWorkWallet } from "@/constants/wallets";
import { useTonConnector } from "@/contexts/custom-ton-provider";
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
import {
  CHAIN,
  WalletInfoCurrentlyEmbedded,
  isWalletInfoCurrentlyEmbedded,
  toUserFriendlyAddress,
} from "@tonconnect/sdk";
import classNames from "classnames";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";

const ConnectModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const oraiAddress = useAuthOraiAddress();
  const oraiWallet = useAuthOraiWallet();
  const tonAddress = useAuthTonAddress();
  const tonWallet = useAuthTonWallet();
  const { connector } = useTonConnector();
  const {
    handleSetOraiAddress,
    handleSetOraiWallet,
    handleSetTonAddress,
    handleSetTonWallet,
  } = useAuthenticationActions();

  const [step, setStep] = useState(oraiAddress ? 2 : 1);
  const [connectStatus, setConnectStatus] = useState<
    OraiWallet | TonWallet | "init"
  >("init");

  const ref = useRef();
  useOnClickOutside(ref, () => setOpen(false));

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
    } catch (error) {
      console.trace({ errorCosmos: error });
      throw new Error(error?.message ?? JSON.stringify(error));
    } finally {
      setConnectStatus("init");
    }
  };

  const handleConnectWalletInTonNetwork = async (walletType: TonWallet) => {
    try {
      setConnectStatus(walletType);

      const walletsList = await connector.getWallets(); // or use `walletsList` fetched before

      const embeddedWallet = walletsList.find(
        isWalletInfoCurrentlyEmbedded
      ) as WalletInfoCurrentlyEmbedded;

      // if (embeddedWallet) {
      //   connector.connect({ jsBridgeKey: embeddedWallet.jsBridgeKey });
      //   return;
      // }

      // await connector.disconnect();

      const addressConnected = tonAddress
        ? tonAddress
        : connector.connect({
            jsBridgeKey: walletType || "tonkeeper",
          });

      return;
    } catch (error) {
      console.log("error connect", error);
    } finally {
      setConnectStatus("init");
    }
  };

  const handleDisconnectOraichain = (walletType: OraiWallet) => {
    if (oraiAddress && walletType === oraiWallet) {
      handleSetOraiAddress({ oraiAddress: undefined }),
        handleSetOraiWallet({ oraiWallet: undefined });
    }
  };

  const handleDisconnectTon = async (walletType: TonWallet) => {
    try {
      if (connector.connected) {
        await connector.disconnect();
      }

      if (tonAddress && walletType === tonWallet) {
        handleSetTonAddress({ tonAddress: undefined });
        handleSetTonWallet({ tonWallet: undefined });
      }
    } catch (error) {
      console.log("error disconnect TON :>>", error);
    }
  };

  const hasInstalledWallet = (wallet: OraiWallet | TonWallet) => {
    if (typeof window === "undefined") {
      return false;
    }

    // @ts-ignore
    const isCheckOwallet = window.owallet?.isOwallet;
    const version = window?.keplr?.version;
    const isCheckKeplr = !!version && keplrCheck("keplr");
    const isMetamask = window?.ethereum?.isMetaMask;

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
  };

  useEffect(() => {
    connector.onStatusChange(
      (wallet) => {
        // console.log("wallet", wallet);
        if (!wallet) {
          if (tonAddress) {
            handleSetTonAddress({ tonAddress: undefined });
            handleSetTonWallet({ tonWallet: undefined });
          }
          return;
        }

        const address = toUserFriendlyAddress(
          wallet.account?.address,
          wallet.account.chain === CHAIN.TESTNET
        );
        const walletType = wallet?.device?.appName?.toLowerCase() as TonWallet;

        handleSetTonAddress({ tonAddress: address });
        handleSetTonWallet({ tonWallet: walletType });
      },
      (err) => {
        console.log("error onStatusChange :>>", err);
      }
    );
  }, [tonAddress]);

  useEffect(() => {
    if (tonAddress && tonWallet) {
      handleConnectWalletInTonNetwork(tonWallet || TonWallet.TonKeeper);
    }
  }, []);

  useEffect(() => {
    if (oraiAddress) {
      setStep(2);
    }
  }, [oraiAddress]);

  //   if (!open) return null;

  return (
    <div
      className={classNames(styles.modalConnectWrapper, {
        [styles.active]: open,
      })}
      // onClick={() => setOpen(false)}
    >
      <div className={styles.content} ref={ref}>
        <div className={styles.header}>
          <span>{step}/2</span>

          <CloseIcon onClick={() => setOpen(false)} className={styles.close} />
        </div>
        <div className={styles.wallet}>
          <div className={styles.left}>
            <h1>Connect to Wallets</h1>
            <p>
              You’ll need to connect both your Oraichain and <br /> TON wallets
              to get started
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
            {(step === 1 ? OraichainWallet : TonNetWorkWallet).map((e, ind) => {
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
                    isNotInstall ? `${e.name} is not installed!` : `${e.name}`
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectModal;

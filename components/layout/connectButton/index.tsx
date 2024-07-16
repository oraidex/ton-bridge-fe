"use client";

import {
  useAuthOraiAddress,
  useAuthTonAddress,
} from "@/stores/authentication/selector";
import classNames from "classnames";
import { FC, useState } from "react";
import ConnectedInfo from "../connectedInfo";
import ConnectModal from "./connectModal";
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
  const tonAddress = useAuthTonAddress();
  const [open, setOpen] = useState(false);

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
        <ConnectedInfo onClick={() => setOpen(true)} />
      )}
      {open && <ConnectModal open={open} setOpen={setOpen} />}
    </div>
  );
};

export default ConnectButton;

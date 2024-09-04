"use client";

import { OraiDEXLogo } from "@/assets/icons/OraiDEXLogo";
import styles from "./index.module.scss";
import ConnectButton from "../connectButton";
import Image from "next/image";

const Header = () => {
  return (
    <div className={styles.header}>
      <OraiDEXLogo />
      <ConnectButton />
    </div>
  );
};

export default Header;

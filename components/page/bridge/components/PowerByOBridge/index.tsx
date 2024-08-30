import cn from "classnames/bind";
import React, { CSSProperties } from "react";
import styles from "./index.module.scss";
import { ObridgeDarkImg, ObridgeLightImg } from "@/assets/icons/obridge";

const PowerByOBridge: React.FC<{ theme: string }> = ({ theme }) => {
  return (
    <div className={styles.powered}>
      <div>Powered by</div>
      {theme === "light" ? <ObridgeDarkImg /> : <ObridgeLightImg />}
    </div>
  );
};

export default PowerByOBridge;

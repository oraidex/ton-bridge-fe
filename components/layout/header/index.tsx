import { OraiDEXLogo } from "@/assets/icons/OraiDEXLogo";
import styles from "./index.module.scss";
import ConnectButton from "../connectButton";

const Header = () => {
  return (
    <div className={styles.header}>
      <OraiDEXLogo />

      {/* <div className={styles.button}>Connect Wallet</div> */}
      <ConnectButton />
    </div>
  );
};

export default Header;

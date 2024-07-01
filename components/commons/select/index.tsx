import { FC, PropsWithChildren, ReactNode } from "react";
import styles from "./index.module.scss";
import { CloseIcon } from "@/assets/icons/action";
import classNames from "classnames";

const SelectCommon: FC<
  PropsWithChildren & {
    triggerElm: ReactNode;
    title: string;
    open: boolean;
    onClose: () => void;
  }
> = ({ triggerElm, title, open, onClose, children }) => {
  return (
    <div className={styles.selectCommon}>
      <div className={styles.triggerElm}>{triggerElm}</div>
      <div
        className={classNames(styles.listSelect, { [styles.active]: !!open })}
      >
        <div className={styles.header}>
          <span>{title}</span>

          <CloseIcon className={styles.close} onClick={() => onClose()} />
        </div>
        {children}
      </div>
    </div>
  );
};

export default SelectCommon;

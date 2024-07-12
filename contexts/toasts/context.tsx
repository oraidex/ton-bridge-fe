"use client";

import { createContext, FC, useContext } from "react";
import { displayToast, DisplayToast } from "./Toast";
import { useTheme } from "../theme-context";
import { Bounce, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "react-toastify/ReactToastify.css";
import "react-toastify/ReactToastify.min.css";

export const ToastContext = createContext<DisplayToast | null>(null);

export const ToastProvider: FC<{ children: ReactChildren }> = ({
  children,
}) => {
  const { theme } = useTheme();

  return (
    <ToastContext.Provider
      value={{
        displayToast,
        theme,
      }}
    >
      {children}

      <ToastContext.Consumer>
        {(value) => (
          <ToastContainer transition={Bounce} toastClassName={value.theme} />
        )}
      </ToastContext.Consumer>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("You have forgot to use ToastProvider");
  }
  return context;
};

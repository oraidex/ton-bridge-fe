import useTokenStore from "./useTokenStore";

export const useTokenActions = () => useTokenStore((state) => state.actions);
export const usePricesCache = () => useTokenStore((state) => state.prices);
export const useAmountsCache = () => useTokenStore((state) => state.amounts);
export const useWalletsTonCache = () =>
  useTokenStore((state) => state.walletsTon);
export const useTonAmountsCache = () =>
  useTokenStore((state) => state.amountsTon);

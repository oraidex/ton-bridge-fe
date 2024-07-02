import usePriceStore from "./usePrices";

export const usePriceActions = () => usePriceStore((state) => state.actions);
export const usePricesCache = () => usePriceStore((state) => state.prices);

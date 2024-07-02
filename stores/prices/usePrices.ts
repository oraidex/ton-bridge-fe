import { CoinGeckoPrices } from "@oraichain/oraidex-common";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface IPrice {
  prices: CoinGeckoPrices<string>;
}

export interface PriceActions {
  handleSetPricesCache: (prices: CoinGeckoPrices<string>) => void;
}

const initialState: IPrice = {
  prices: {},
};

const usePriceStore = create<IPrice & { actions: PriceActions }>()(
  persist(
    immer((set) => ({
      //States
      ...initialState,

      //Actions
      actions: {
        handleSetPricesCache: (prices) =>
          set((state) => {
            prices;
          }),
      },
    })),
    {
      name: "Zus:Prices",
      partialize: ({ prices }) => ({
        prices,
      }),
    }
  )
);

export default usePriceStore;

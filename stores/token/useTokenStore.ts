import { CoinGeckoPrices } from "@oraichain/oraidex-common";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface IToken {
  prices: CoinGeckoPrices<string>;
  amounts: AmountDetails;
  amountsTon: AmountDetails;
}

export interface TokenActions {
  handleSetPricesCache: (prices: CoinGeckoPrices<string>) => void;
  handleSetAmountsCache: (amounts: AmountDetails) => void;
  handleSetTonAmountsCache: (amountsTon: AmountDetails) => void;
}

const initialState: IToken = {
  prices: {},
  amounts: {},
  amountsTon: {},
};

const useTokenStore = create<IToken & { actions: TokenActions }>()(
  persist(
    immer((set) => ({
      //States
      ...initialState,

      //Actions
      actions: {
        handleSetPricesCache: (prices) =>
          set({
            prices,
          }),
        handleSetAmountsCache: (amounts) =>
          set((state) => {
            state.amounts = {
              ...state.amounts,
              ...amounts,
            };
          }),
        handleSetTonAmountsCache: (amountsTon) =>
          set((state) => {
            state.amountsTon = {
              ...state.amountsTon,
              ...amountsTon,
            };
          }),
      },
    })),
    {
      name: "Zus:Tokens",
      partialize: ({ prices, amounts, amountsTon }) => ({
        prices,
        amounts,
        amountsTon,
      }),
    }
  )
);

export default useTokenStore;

import { NetworkType, WalletType } from "@oraichain/oraidex-common";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export enum OraiWallet {
  OWallet = "owallet",
  Metamask = "eip191",
  Keplr = "keplr",
}

export enum TonWallet {
  TonKeeper = "tonkeeper",
  MyTonWallet = "mytonwallet",
}

export type WalletNetwork = {
  icon: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string;
    }
  >;
  name: string;
  nameRegistry?: WalletType;
  isActive: boolean;
  suffixName?: string;
};

export type ChainWallet = {
  icon: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string;
    }
  >;
  name: string;
  chainName: string;
};

export type WalletProvider = {
  networkType: NetworkType;
  networks: any[];
  wallets: WalletNetwork[];
};

interface Authentication {
  oraiAddress?: string;
  tonAddress?: string;
  tonWallet?: TonWallet;
  oraiWallet?: OraiWallet;
}

export interface AuthenticationAction {
  handleSetOraiAddress: ({
    oraiAddress,
  }: Pick<Authentication, "oraiAddress">) => void;
  handleRemoveOraiAddress: () => void;
  handleSetTonAddress: ({
    tonAddress,
  }: Pick<Authentication, "tonAddress">) => void;
  handleRemoveTonAddress: () => void;
  handleSetOraiWallet: ({
    oraiWallet,
  }: Pick<Authentication, "oraiWallet">) => void;
  handleRemoveOraiWallet: () => void;
  handleSetTonWallet: ({
    tonWallet,
  }: Pick<Authentication, "tonWallet">) => void;
  handleRemoveTonWallet: () => void;
}

const initialState = {
  oraiAddress: undefined,
  tonAddress: undefined,
  tonWallet: undefined,
  oraiWallet: undefined,
};

const useAuthenticationStore = create<
  Authentication & { actions: AuthenticationAction }
>()(
  persist(
    immer((set) => ({
      //States
      ...initialState,

      //Actions
      actions: {
        handleSetOraiAddress: ({ oraiAddress }) => set({ oraiAddress }),
        handleRemoveOraiAddress: () =>
          set((state) => {
            state.oraiAddress = "";
          }),

        handleSetTonAddress: ({ tonAddress }) => set({ tonAddress }),
        handleRemoveTonAddress: () =>
          set((state) => {
            state.tonAddress = "";
          }),

        handleSetOraiWallet: ({ oraiWallet }) => set({ oraiWallet }),
        handleRemoveOraiWallet: () =>
          set((state) => {
            state.oraiWallet = undefined;
          }),

        handleSetTonWallet: ({ tonWallet }) => set({ tonWallet }),
        handleRemoveTonWallet: () =>
          set((state) => {
            state.tonWallet = undefined;
          }),
      },
    })),
    {
      name: "Zus:Authentication",
      partialize: ({ oraiAddress, oraiWallet, tonAddress, tonWallet }) => ({
        oraiAddress,
        oraiWallet,
        tonAddress,
        tonWallet,
      }),
    }
  )
);

export default useAuthenticationStore;

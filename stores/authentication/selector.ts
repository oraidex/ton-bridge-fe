import useAuthenticationStore from "./useAuthenticationStore";

export const useAuthenticationActions = () =>
  useAuthenticationStore((state) => state.actions);
export const useAuthOraiAddress = () =>
  useAuthenticationStore((state) => state.oraiAddress);
export const useAuthTonAddress = () =>
  useAuthenticationStore((state) => state.tonAddress);
export const useAuthTonWallet = () =>
  useAuthenticationStore((state) => state.tonWallet);
export const useAuthOraiWallet = () =>
  useAuthenticationStore((state) => state.oraiWallet);

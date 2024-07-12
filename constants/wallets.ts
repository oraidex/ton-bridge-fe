import {
  KeplrIcon,
  MetamaskIcon,
  OwalletIcon,
  TonKeeperIcon,
} from "@/assets/icons/wallet";
import {
  OraiWallet,
  TonWallet,
} from "@/stores/authentication/useAuthenticationStore";

export const OraichainWallet = [
  {
    icon: OwalletIcon,
    id: OraiWallet.OWallet,
    name: "Owallet",
  },
  {
    icon: MetamaskIcon,
    id: OraiWallet.Metamask,
    name: "Metamask",
  },
  {
    icon: KeplrIcon,
    id: OraiWallet.Keplr,
    name: "Keplr",
  },
];

export const TonNetWorkWallet = [
  // {
  //   icon: TonNetworkICon,
  //   id: TonWallet.TonKeeper,
  //   name: "TonKeeper",
  // },
  {
    icon: TonKeeperIcon,
    id: TonWallet.TonKeeper,
    name: "Tonkeeper",
  },
  // {
  //   icon: MyTonWalletIcon,
  //   id: TonWallet.MyTonWallet,
  //   name: "MyTonWallet",
  // },
];

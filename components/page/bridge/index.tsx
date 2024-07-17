"use client";

import { SwapIcon } from "@/assets/icons/action";
import { TonNetworkICon } from "@/assets/icons/network";
import { OraiIcon } from "@/assets/icons/token";
import Loader from "@/components/commons/loader/Loader";
import ConnectButton from "@/components/layout/connectButton";
import { TON_SCAN } from "@/constants/config";
import {
  TON_ADDRESS_CONTRACT,
  TonInteractionContract,
  TonNetwork,
  network,
} from "@/constants/networks";
import { TokenType, TonTokenList } from "@/constants/tokens";
import { useTonConnector } from "@/contexts/custom-ton-provider";
import { TToastType, displayToast } from "@/contexts/toasts/Toast";
import { getTransactionUrl, handleErrorTransaction } from "@/helper";
import { useLoadToken, useLoadTonBalance } from "@/hooks/useLoadToken";
import {
  useAuthOraiAddress,
  useAuthTonAddress,
} from "@/stores/authentication/selector";
import { toBinary } from "@cosmjs/cosmwasm-stargate";
import {
  BigDecimal,
  CW20_DECIMALS,
  handleSentFunds,
  toAmount,
} from "@oraichain/oraidex-common";
import { BridgeAdapter, JettonMinter } from "@oraichain/ton-bridge-contracts";
import { TonbridgeBridgeClient } from "@oraichain/tonbridge-contracts-sdk";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { Address, Cell, Dictionary, beginCell, toNano } from "@ton/core";
import { TonClient } from "@ton/ton";
import { Base64 } from "@tonconnect/protocol";
import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import InputBridge, { NetworkType } from "./components/inputBridge";
import { JettonWallet } from "@oraichain/ton-bridge-contracts";
import { fromBech32 } from "@cosmjs/encoding";
import useGetFee from "./hooks/useGetFee";
import {
  DECIMAL_TOKEN_FEE,
  formatDisplayNumber,
  numberWithCommas,
} from "@/helper/number";

const Bridge = () => {
  const oraiAddress = useAuthOraiAddress();
  const tonAddress = useAuthTonAddress();
  const { connector } = useTonConnector();
  const [txtSearch, setTxtSearch] = useState<string>();
  const tonNetwork = TonNetwork.Mainnet;

  const { loadToken } = useLoadToken();
  const { loadAllBalanceTonToken } = useLoadTonBalance({
    tonAddress,
    tonNetwork,
  });
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(null);
  const [token, setToken] = useState<TokenType>(null);
  const [fromNetwork, setFromNetwork] = useState(NetworkList.ton);
  const [toNetwork, setToNetwork] = useState(NetworkList.oraichain);
  const [tokenInfo, setTokenInfo] = useState({
    jettonWalletAddress: null,
  });

  const destinationAddress =
    toNetwork.id === NetworkList.oraichain.id
      ? oraiAddress || ""
      : tonAddress || "";

  const { bridgeFee, tokenFee } = useGetFee({
    token,
    amount,
  });

  // @dev: this function will changed based on token minter address (which is USDT, USDC, bla bla bla)
  useEffect(() => {
    try {
      (async () => {
        if (toNetwork.id != NetworkList.oraichain.id || !token) return;

        // get the decentralized RPC endpoint
        const endpoint = await getHttpEndpoint();
        const client = new TonClient({
          endpoint,
        });

        if (token?.contractAddress === TON_ADDRESS_CONTRACT) {
          setTokenInfo({
            jettonWalletAddress: "",
          });
          return;
        }

        const jettonMinter = JettonMinter.createFromAddress(
          Address.parse(token.contractAddress)
        );
        const jettonMinterContract = client.open(jettonMinter);
        const jettonWalletAddress = await jettonMinterContract.getWalletAddress(
          Address.parse(tonAddress)
        );

        setTokenInfo({
          jettonWalletAddress,
        });
      })();
    } catch (error) {
      console.log("error :>>", error);
    }
  }, [token]); // toNetwork, tonAddress

  const handleBridgeFromTon = async () => {
    try {
      if (!oraiAddress) {
        throw "Please connect OWallet or Kelpr!";
      }

      if (!tonAddress) {
        throw "Please connect Ton Wallet";
      }

      if (!token || !amount) {
        throw "Not valid!";
      }

      setLoading(true);
      const bridgeAdapterAddress = Address.parse(
        TonInteractionContract[tonNetwork].bridgeAdapter
      );
      const fmtAmount = new BigDecimal(10).pow(token.decimal).mul(amount);
      const isNativeTon: boolean = token && !token.contractAddress;
      const toAddress: string = isNativeTon
        ? bridgeAdapterAddress.toString()
        : tokenInfo.jettonWalletAddress?.toString();
      const oraiAddressBech32 = fromBech32(oraiAddress).data;
      const toAmount = isNativeTon
        ? fmtAmount.add(toNano(1)).toString()
        : toNano(1).toString();
      const timeout = BigInt(Math.floor(new Date().getTime() / 1000) + 3600);
      const memo = beginCell().endCell();

      const getNativeBridgePayload = () =>
        BridgeAdapter.buildBridgeTonBody(
          {
            amount: BigInt(fmtAmount.toString()),
            memo,
            remoteReceiver: oraiAddress,
            timeout,
          },
          oraiAddressBech32,
          {
            queryId: 0,
            value: toNano(0), // don't care this
          }
        ).toBoc();

      const getOtherBridgeTokenPayload = () =>
        JettonWallet.buildSendTransferPacket(
          Address.parse(tonAddress),
          {
            fwdAmount: toNano("0.1"),
            jettonAmount: BigInt(fmtAmount.toString()),
            jettonMaster: Address.parse(token.contractAddress),
            remoteReceiver: oraiAddress,
            timeout,
            memo,
            toAddress: bridgeAdapterAddress,
          },
          0
        ).toBoc();

      const tx = await connector.sendTransaction({
        validUntil: 100000,
        messages: [
          {
            address: toAddress, // dia chi token
            amount: toAmount, // gas
            payload: Base64.encode(
              isNativeTon
                ? getNativeBridgePayload()
                : getOtherBridgeTokenPayload()
            ),
          },
        ],
      });

      const txHash = Cell.fromBoc(Buffer.from(tx.boc, "base64"))[0]
        .hash()
        .toString("hex");

      if (txHash) {
        displayToast(TToastType.TX_SUCCESSFUL, {
          customLink: `${TON_SCAN}/transaction/${txHash}`,
        });

        loadToken({ oraiAddress });
        loadAllBalanceTonToken();
      }
    } catch (error) {
      console.log("error Bridge from TON :>>", error);

      handleErrorTransaction(error, {
        tokenName: token.symbol,
        chainName: toNetwork.name,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBridgeFromOraichain = async () => {
    try {
      if (!oraiAddress) {
        throw "Please connect OWallet or Kelpr!";
      }

      if (!tonAddress) {
        throw "Please connect Ton Wallet";
      }

      if (!token || !amount) {
        throw "Not valid!";
      }

      setLoading(true);

      const tonBridgeClient = new TonbridgeBridgeClient(
        window.client,
        oraiAddress,
        network.CW_TON_BRIDGE
      );

      let tx;

      const timeout = Math.floor(new Date().getTime() / 1000) + 3600;
      const msg = {
        // crcSrc: ARG_BRIDGE_TO_TON.CRC_SRC,
        denom: TonTokenList(tonNetwork).find(
          (tk) => tk.coingeckoId === token.coingeckoId
        ).contractAddress,
        timeout,
        to: tonAddress,
      };

      const funds = handleSentFunds({
        denom: token.denom,
        amount: toAmount(amount, token.decimal).toString(),
      });

      // native token
      if (!token.contractAddress) {
        tx = await tonBridgeClient.bridgeToTon(msg, "auto", null, funds);
      }
      // cw20 token
      else {
        tx = await window.client.execute(
          oraiAddress,
          token.contractAddress,
          {
            send: {
              contract: network.CW_TON_BRIDGE,
              amount: toAmount(amount, token.decimal).toString(),
              msg: toBinary({
                denom: msg.denom,
                timeout,
                to: msg.to,
              }),
            },
          },
          "auto"
        );
      }

      if (tx?.transactionHash) {
        displayToast(TToastType.TX_SUCCESSFUL, {
          customLink: getTransactionUrl(
            fromNetwork.id as any,
            tx.transactionHash
          ),
        });
        loadToken({ oraiAddress });
        loadAllBalanceTonToken();
      }
    } catch (error) {
      console.log("error Bridge from Oraichain :>>", error);
      handleErrorTransaction(error, {
        tokenName: token.symbol,
        chainName: toNetwork.name,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.swapWrapper}>
      <div className={styles.header}>TON Bridge</div>

      <div className={styles.content}>
        <div className={styles.divider}></div>
        <div className={styles.handler}>
          <div className={styles.select}>
            <div className={styles.fromTo}>
              <h2>From</h2>
              <div className={styles.networkItem}>
                <fromNetwork.Icon />
                {fromNetwork.name}
              </div>
            </div>
            <SwapIcon
              className={styles.switch}
              onClick={() => {
                const [currentTo, currentFrom] = [toNetwork, fromNetwork];
                setFromNetwork(currentTo);
                setToNetwork(currentFrom);
                setToken(null);
              }}
            />
            <div className={styles.fromTo}>
              <h2>To</h2>
              <div className={styles.networkItem}>
                <toNetwork.Icon />
                {toNetwork.name}
              </div>
            </div>
          </div>
          <div className={styles.input}>
            <InputBridge
              txtSearch={txtSearch}
              setTxtSearch={setTxtSearch}
              amount={amount}
              onChangeAmount={(val) => setAmount(val)}
              token={token}
              tonNetwork={tonNetwork}
              setToken={setToken}
              networkTo={toNetwork.id as NetworkType}
            />
          </div>
          <div className={styles.destination}>
            <p>Destination address</p>
            <p className={styles.addressTo} title={destinationAddress}>
              {/* {toNetwork.id === NetworkList.oraichain.id
                ? oraiAddress || ""
                : reduceString(tonAddress || "", 12, 12)} */}
              {destinationAddress}
            </p>
          </div>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.est}>
          <div className={styles.itemEst}>
            <span>TON gas fee</span>
            {/* <span className={styles.value}>~ 0.0017 ORAI</span> */}
            <span className={styles.value}>~ 1 TON</span>
          </div>
          <div className={styles.itemEst}>
            <span>Bridge fee</span>
            {/* <span className={styles.value}>1 TON</span> */}
            <span className={styles.value}>
              {numberWithCommas(bridgeFee || 0, undefined, {
                maximumFractionDigits: CW20_DECIMALS,
              })}{" "}
              ORAI
            </span>
          </div>
          <div className={styles.itemEst}>
            <span>Token fee</span>
            {/* <span className={styles.value}>1 TON</span> */}
            <span className={styles.value}>
              {!token ? "--" : formatDisplayNumber(tokenFee, DECIMAL_TOKEN_FEE)}{" "}
              {token?.symbol}
            </span>
          </div>
        </div>

        <div className={styles.button}>
          {oraiAddress && tonAddress ? (
            <button
              disabled={loading || !token || !amount}
              onClick={() => {
                fromNetwork.id === "Ton"
                  ? handleBridgeFromTon()
                  : handleBridgeFromOraichain();
              }}
              className={styles.bridgeBtn}
            >
              {loading && <Loader width={22} height={22} />}
              Bridge
            </button>
          ) : (
            <ConnectButton fullWidth />
          )}
        </div>
      </div>
    </div>
  );
};

export default Bridge;

export const NetworkList = {
  ton: {
    name: "TON",
    id: "Ton",
    Icon: TonNetworkICon,
  },
  oraichain: {
    name: "Oraichain",
    id: "Oraichain",
    Icon: OraiIcon,
  },
};

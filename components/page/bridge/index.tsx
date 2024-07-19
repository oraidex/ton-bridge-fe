"use client";

import { SwapIcon } from "@/assets/icons/action";
import { TonNetworkICon } from "@/assets/icons/network";
import { OraiIcon } from "@/assets/icons/token";
import Loader from "@/components/commons/loader/Loader";
import ConnectButton from "@/components/layout/connectButton";
import { TON_SCAN } from "@/constants/config";
import mixpanel from "mixpanel-browser";
import {
  TON_ADDRESS_CONTRACT,
  TonInteractionContract,
  TonNetwork,
  network,
} from "@/constants/networks";
import {
  OraichainTokenList,
  TokenType,
  TonTokenList,
} from "@/constants/tokens";
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
  toDisplay,
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
import { useAmountsCache, useTonAmountsCache } from "@/stores/token/selector";
import useGetStateData from "./hooks/useGetStateData";
import {
  initFromNetwork,
  initToNetwork,
  useFillNetwork,
} from "@/hooks/useFillNetwork";
import {
  FWD_AMOUNT,
  TON_MESSAGE_VALID_UNTIL,
  BRIDGE_TON_TO_ORAI_MINIMUM_GAS,
} from "./constants";
import { getMixPanelClient } from "@/libs/mixpanel";

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

  const amounts = useAmountsCache();
  const amountsTon = useTonAmountsCache();
  const { balances: sentBalance, getChanelStateData } = useGetStateData();

  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(null);
  const [token, setToken] = useState<TokenType>(null);
  const [fromNetwork, setFromNetwork] = useState(initFromNetwork);
  const [toNetwork, setToNetwork] = useState(initToNetwork);
  const [tokenInfo, setTokenInfo] = useState({
    jettonWalletAddress: null,
  });
  const [deductNativeAmount, setDeductNativeAmount] = useState(0n);

  const destinationAddress =
    toNetwork.id === NetworkList.oraichain.id
      ? oraiAddress || ""
      : tonAddress || "";

  const { bridgeFee, tokenFee } = useGetFee({
    token,
  });

  const { handleUpdateQueryURL } = useFillNetwork({
    setFromNetwork,
    setToNetwork,
  });

  useEffect(() => {
    if (
      toNetwork.id == NetworkList.oraichain.id &&
      token?.contractAddress === TON_ADDRESS_CONTRACT
    ) {
      setDeductNativeAmount(BRIDGE_TON_TO_ORAI_MINIMUM_GAS);
      return;
    }
    setDeductNativeAmount(0n);
  }, [toNetwork, token]);

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
          setDeductNativeAmount(BRIDGE_TON_TO_ORAI_MINIMUM_GAS);
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
        setDeductNativeAmount(0n);
      })();
    } catch (error) {
      console.log("error :>>", error);
    }
  }, [token]); // toNetwork, tonAddress

  const handleCheckBalanceBridgeOfTonNetwork = async (token: TokenType) => {
    try {
      // get the decentralized RPC endpoint
      const endpoint = await getHttpEndpoint();
      const client = new TonClient({
        endpoint,
      });
      const bridgeAdapter =
        TonInteractionContract[TonNetwork.Mainnet].bridgeAdapter;

      if (token.contractAddress === TON_ADDRESS_CONTRACT) {
        const balance = await client.getBalance(Address.parse(bridgeAdapter));

        return {
          balance: balance,
        };
      }

      const jettonMinter = JettonMinter.createFromAddress(
        Address.parse(token.contractAddress)
      );
      const jettonMinterContract = client.open(jettonMinter);
      const jettonWalletAddress = await jettonMinterContract.getWalletAddress(
        Address.parse(bridgeAdapter)
      );
      const jettonWallet = JettonWallet.createFromAddress(jettonWalletAddress);
      const jettonWalletContract = client.open(jettonWallet);
      const balance = await jettonWalletContract.getBalance();

      return {
        balance: balance.amount,
      };
    } catch (error) {
      console.log("error :>> handleCheckBalanceBridgeOfTonNetwork", error);
    }
  };

  const handleCheckBalanceBridgeOfOraichain = async (token: TokenType) => {
    try {
      if (token) {
        const tx = await window.client.queryContractSmart(
          token.contractAddress,
          {
            balance: { address: network.CW_TON_BRIDGE },
          }
        );

        return {
          balance: tx?.balance || 0,
        };
      }
    } catch (error) {
      console.log("error :>> handleCheckBalanceBridgeOfOraichain", error);
    }
  };

  const checkBalanceBridgeByNetwork = async (
    networkFrom: string,
    token: TokenType
  ) => {
    const handler = {
      [NetworkList.oraichain.id]: handleCheckBalanceBridgeOfTonNetwork,
      [NetworkList.ton.id]: handleCheckBalanceBridgeOfOraichain,
    };

    const { balance } = handler[networkFrom]
      ? await handler[networkFrom](token)
      : { balance: 0 };

    return toDisplay(balance || 0, token.decimal || CW20_DECIMALS);
  };

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

      const tokenInOrai = OraichainTokenList.find(
        (tk) => tk.coingeckoId === token.coingeckoId
      );
      const balanceMax = await checkBalanceBridgeByNetwork(
        NetworkList.ton.id,
        tokenInOrai
      );

      if (Number(balanceMax) < Number(amount)) {
        setLoading(false);
        throw `The bridge contract does not have enough balance to process this bridge transaction. Wanted ${amount} ${token.symbol}, have ${balanceMax} ${token.symbol}`;
      }

      const bridgeAdapterAddress = Address.parse(
        TonInteractionContract[tonNetwork].bridgeAdapter
      );
      const fmtAmount = new BigDecimal(10).pow(token.decimal).mul(amount);
      const isNativeTon: boolean =
        token.contractAddress === TON_ADDRESS_CONTRACT;
      const toAddress: string = isNativeTon
        ? bridgeAdapterAddress.toString()
        : tokenInfo.jettonWalletAddress?.toString();
      const oraiAddressBech32 = fromBech32(oraiAddress).data;
      const gasAmount = isNativeTon
        ? fmtAmount.add(BRIDGE_TON_TO_ORAI_MINIMUM_GAS).toString()
        : BRIDGE_TON_TO_ORAI_MINIMUM_GAS.toString();
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
            fwdAmount: FWD_AMOUNT,
            jettonAmount: BigInt(fmtAmount.toString()),
            jettonMaster: Address.parse(token.contractAddress),
            remoteReceiver: oraiAddress,
            timeout,
            memo,
            toAddress: bridgeAdapterAddress,
          },
          0
        ).toBoc();

      const boc = isNativeTon
        ? getNativeBridgePayload()
        : getOtherBridgeTokenPayload();

      const tx = await connector.sendTransaction({
        validUntil: TON_MESSAGE_VALID_UNTIL,
        messages: [
          {
            address: toAddress, // dia chi token
            amount: gasAmount, // gas
            payload: Base64.encode(boc),
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
        getChanelStateData();

        setAmount(0);
      }
    } catch (error) {
      console.log("error Bridge from TON :>>", error);

      handleErrorTransaction(error, {
        tokenName: token.symbol,
        chainName: toNetwork.name,
      });
    } finally {
      setLoading(false);
      const mp = getMixPanelClient();
      const logEvent = {
        fromNetwork,
        toNetwork,
        token,
        amount,
      };
      mp.track("Bridge Ton Oraidex", logEvent);
      // mixpanel.track("Bridge Ton Oraidex", logEvent);
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

      const tokenInTon = TonTokenList(TonNetwork.Mainnet).find(
        (tk) => tk.coingeckoId === token.coingeckoId
      );

      const balanceMax = (sentBalance || []).find(
        (b) => b.native.denom === tokenInTon.contractAddress
      )?.native.amount;

      // const balanceMax = await checkBalanceBridgeByNetwork(
      //   NetworkList.oraichain.id,
      //   tokenInTon
      // );

      const displayBalance = toDisplay(
        balanceMax,
        tokenInTon?.decimal || CW20_DECIMALS
      );

      if (displayBalance < Number(amount)) {
        setLoading(false);
        throw `The bridge contract does not have enough balance to process this bridge transaction. Wanted ${amount} ${token.symbol}, have ${displayBalance} ${token.symbol}`;
      }

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

        setAmount(0);
      }
    } catch (error) {
      console.log("error Bridge from Oraichain :>>", error);
      handleErrorTransaction(error, {
        tokenName: token.symbol,
        chainName: toNetwork.name,
      });
    } finally {
      setLoading(false);
      const mp = getMixPanelClient();
      const logEvent = {
        fromNetwork,
        toNetwork,
        token,
        amount,
      };
      mp.track("Bridge Ton Oraidex", logEvent);
    }
  };

  const isInsufficientBalance =
    fromNetwork.id === NetworkList.oraichain.id
      ? Number(amount) > toDisplay(amounts[token?.denom] || "0")
      : Number(amount) >
        toDisplay(amountsTon[token?.denom] || "0", token?.decimal);

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
                handleUpdateQueryURL([currentTo.id, currentFrom.id]);
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
              deductNativeAmount={deductNativeAmount}
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
          {toNetwork.id === NetworkList.oraichain.id && (
            <div className={styles.itemEst}>
              <span>TON gas fee</span>
              {/* <span className={styles.value}>~ 0.0017 ORAI</span> */}
              <span className={styles.value}>~ 1 TON</span>
            </div>
          )}
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
              {!token
                ? "--"
                : formatDisplayNumber(
                    new BigDecimal(tokenFee).mul(amount || 0).toNumber(),
                    DECIMAL_TOKEN_FEE
                  )}{" "}
              {token?.symbol}
            </span>
          </div>
        </div>

        <div className={styles.button}>
          {oraiAddress && tonAddress ? (
            <button
              disabled={loading || !token || !amount || isInsufficientBalance}
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

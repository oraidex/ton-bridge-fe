"use client";

import { SwapIcon } from "@/assets/icons/action";
import { TonNetworkICon } from "@/assets/icons/network";
import { OraiIcon } from "@/assets/icons/token";
import Loader from "@/components/commons/loader/Loader";
import ConnectButton from "@/components/layout/connectButton";
import {
  ARG_BRIDGE_TO_TON,
  SEND_TON_TRANFERS_CONFIG,
  TON_SCAN,
} from "@/constants/config";
import {
  TonInteractionContract,
  TonNetwork,
  network,
} from "@/constants/networks";
import { TonTokenList } from "@/constants/tokens";
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
  handleSentFunds,
  toAmount,
} from "@oraichain/oraidex-common";
import {
  JettonMinter,
  JettonOpCodes,
  JettonWallet,
} from "@oraichain/ton-bridge-contracts";
import { TonbridgeBridgeClient } from "@oraichain/tonbridge-contracts-sdk";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import {
  Address,
  Cell,
  Dictionary,
  beginCell,
  crc32c,
  toNano,
} from "@ton/core";
import { TonClient } from "@ton/ton";
import { Base64 } from "@tonconnect/protocol";
import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import InputBridge, { NetworkType } from "./inputBridge";

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

const Bridge = () => {
  const oraiAddress = useAuthOraiAddress();
  const tonAddress = useAuthTonAddress();
  const { connector } = useTonConnector();
  const [txtSearch, setTxtSearch] = useState<string>();

  const { loadToken } = useLoadToken();
  const { loadBalanceByToken } = useLoadTonBalance({
    tonAddress,
    tonNetwork: TonNetwork.Mainnet,
  });
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(null);
  const [token, setToken] = useState(null);
  const [fromNetwork, setFromNetwork] = useState(NetworkList.ton);
  const [toNetwork, setToNetwork] = useState(NetworkList.oraichain);
  const [tokenInfo, setTokenInfo] = useState({
    jettonWalletAddress: null,
    balance: 0n,
  });

  const tonNetwork = TonNetwork.Mainnet;

  // @dev: this function will changed based on token minter address (which is USDT, USDC, bla bla bla)
  useEffect(() => {
    (async () => {
      if (toNetwork.id != NetworkList.oraichain.id || !token) return;

      // get the decentralized RPC endpoint
      const endpoint = await getHttpEndpoint();
      const client = new TonClient({
        endpoint,
      });

      if (!token?.contractAddress) {
        const balance = await client.getBalance(Address.parse(tonAddress));

        setTokenInfo({
          balance: balance,
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
      const jettonWallet = JettonWallet.createFromAddress(jettonWalletAddress);
      const jettonWalletContract = client.open(jettonWallet);
      const balance = await jettonWalletContract.getBalance();

      setTokenInfo({
        balance: balance.amount,
        jettonWalletAddress,
      });
    })();
  }, [token]); // toNetwork, tonAddress

  const destinationAddress =
    toNetwork.id === NetworkList.oraichain.id
      ? oraiAddress || ""
      : tonAddress || "";

  const handleBridgeFromTon = async () => {
    try {
      if (!token || !amount) {
        throw "Not valid!";
      }

      setLoading(true);

      const fmtAmount = new BigDecimal(10)
        .pow(token.decimal)
        .mul(amount)
        .toNumber();

      console.log(token && !token.contractAddress);
      const tx = await connector.sendTransaction({
        validUntil: 100000,
        messages: [
          {
            address:
              token && !token.contractAddress
                ? Address.parse(
                    TonInteractionContract[TonNetwork.Mainnet].bridgeAdapter
                  )
                : tokenInfo.jettonWalletAddress.toString(), // dia chi token
            amount:
              token && !token.contractAddress
                ? (fmtAmount + 1000000000).toString()
                : toNano(1).toString(), // gas
            payload:
              token && !token.contractAddress
                ? Base64.encode(
                    beginCell()
                      .storeUint(4062002313, 32)
                      .storeUint(0, 64)
                      .storeRef(
                        beginCell()
                          .storeCoins(fmtAmount)
                          .storeUint(
                            Math.floor(new Date().getTime() / 1000) + 3600,
                            64
                          )
                          .storeRef(
                            beginCell()
                              .storeRef(
                                beginCell()
                                  .storeBuffer(Buffer.from(""))
                                  .endCell()
                              )
                              .storeRef(
                                beginCell()
                                  .storeBuffer(Buffer.from("channel-0"))
                                  .endCell()
                              )
                              .storeRef(
                                beginCell()
                                  .storeBuffer(Buffer.from(""))
                                  .endCell()
                              )
                              .storeRef(
                                beginCell()
                                  .storeBuffer(Buffer.from(oraiAddress))
                                  .endCell()
                              )
                              .endCell()
                          )
                          .endCell()
                      )
                      .endCell()
                      .toBoc()
                  )
                : Base64.encode(
                    beginCell()
                      .storeUint(JettonOpCodes.TRANSFER, 32)
                      .storeUint(0, 64)
                      .storeCoins(fmtAmount)
                      .storeAddress(
                        Address.parse(
                          TonInteractionContract[TonNetwork.Mainnet]
                            .bridgeAdapter
                        )
                      ) // to address => Bridge Adapter
                      .storeAddress(Address.parse(tonAddress)) // response address
                      .storeDict(Dictionary.empty())
                      .storeCoins(SEND_TON_TRANFERS_CONFIG.fwdAmount)
                      .storeUint(0, 1)
                      .storeRef(
                        beginCell()
                          .storeAddress(Address.parse(token.contractAddress))
                          .storeUint(SEND_TON_TRANFERS_CONFIG.timeout, 64)
                          .endCell()
                      )
                      .storeRef(
                        beginCell()
                          .storeRef(
                            beginCell().storeBuffer(Buffer.from("")).endCell()
                          )
                          .storeRef(
                            beginCell()
                              .storeBuffer(Buffer.from("channel-0"))
                              .endCell()
                          )
                          .storeRef(
                            beginCell().storeBuffer(Buffer.from("")).endCell()
                          )
                          .storeRef(
                            beginCell()
                              .storeBuffer(Buffer.from(oraiAddress))
                              .endCell()
                          )
                          .endCell()
                      )
                      .endCell()
                      .toBoc()
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

        loadToken({ oraiAddress, tonAddress });
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

      const msg = {
        // crcSrc: ARG_BRIDGE_TO_TON.CRC_SRC,
        denom: TonTokenList(tonNetwork).find(
          (tk) => tk.coingeckoId === token.coingeckoId
        ).contractAddress,
        localChannelId: ARG_BRIDGE_TO_TON.CHANNEL,
        to: tonAddress,
      };
      const funds = handleSentFunds({
        denom: token.denom,
        amount,
      });

      // native token
      if (!token.contractAddress) {
        tx = await tonBridgeClient.bridgeToTon(msg, "auto", null, funds);
      } else {
        // cw20 token
        tx = await window.client.execute(
          oraiAddress,
          token.contractAddress,
          {
            send: {
              contract: network.CW_TON_BRIDGE,
              amount: toAmount(amount).toString(),
              msg: toBinary({
                // crc_src: msg.crcSrc,
                denom: msg.denom,
                local_channel_id: msg.localChannelId,
                to: msg.to,
              }),
            },
          },
          "auto"
        );
      }

      console.log("tx", tx);

      if (tx?.transactionHash) {
        displayToast(TToastType.TX_SUCCESSFUL, {
          customLink: getTransactionUrl(
            fromNetwork.id as any,
            tx.transactionHash
          ),
        });
        loadToken({ oraiAddress, tonAddress });
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
              balance={tokenInfo.balance}
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
            <span>Oraichain gas fee</span>
            {/* <span className={styles.value}>~ 0.0017 ORAI</span> */}
            <span className={styles.value}>~ 0 ORAI</span>
          </div>
          <div className={styles.itemEst}>
            <span>Bridge fee</span>
            {/* <span className={styles.value}>1 TON</span> */}
            <span className={styles.value}>0 TON</span>
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
          {/* <button className={styles.bridgeBtn}>Bridge</button> */}
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

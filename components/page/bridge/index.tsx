"use client";

import {
  useAuthOraiAddress,
  useAuthTonAddress,
} from "@/stores/authentication/selector";
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import ConnectButton from "@/components/layout/connectButton";
import InputBridge, { NetworkType } from "./inputBridge";
import { SwapIcon } from "@/assets/icons/action";
import { TonNetworkICon } from "@/assets/icons/network";
import { OraiIcon } from "@/assets/icons/token";
import { useTonConnector } from "@/contexts/custom-ton-provider";
import {
  Address,
  Cell,
  Dictionary,
  OpenedContract,
  beginCell,
  toNano,
} from "@ton/core";
import { JettonOpCodes } from "@oraichain/ton-bridge-contracts";
import {
  ARG_BRIDGE_TO_TON,
  SEND_TON_TRANFERS_CONFIG,
  TON_SCAN,
} from "@/constants/config";
import {
  BigDecimal,
  handleSentFunds,
  toAmount,
} from "@oraichain/oraidex-common";
import {
  TonInteractionContract,
  TonNetwork,
  TonTokensContract,
  network,
} from "@/constants/networks";
import { Base64 } from "@tonconnect/protocol";
import { TToastType, displayToast } from "@/contexts/toasts/Toast";
import { getTransactionUrl, handleErrorTransaction } from "@/helper";
import { TonClient, JettonMaster, JettonWallet } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonbridgeBridgeClient } from "@oraichain/tonbridge-contracts-sdk";
import { TonTokenList } from "@/constants/tokens";
import { toBinary } from "@cosmjs/cosmwasm-stargate";
import Loader from "@/components/commons/loader/Loader";
import { useLoadToken } from "@/hooks/useLoadToken";

const Bridge = () => {
  const oraiAddress = useAuthOraiAddress();
  const tonAddress = useAuthTonAddress();
  const { connector } = useTonConnector();

  const { loadToken } = useLoadToken();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(null);
  const [token, setToken] = useState(null);
  const [fromNetwork, setFromNetwork] = useState(NetworkList.ton);
  const [toNetwork, setToNetwork] = useState(NetworkList.oraichain);
  const [jettonWalletAddress, setJettonWalletAddress] = useState<Address>(null);
  const [tokenBalance, setTokenBalance] = useState(0n);

  useEffect(() => {
    (async () => {
      const client = new TonClient({
        endpoint: "https://toncenter.com/api/v2/jsonRPC",
      });
      console.log(TonTokensContract[TonNetwork.Mainnet].usdt);
      const jettonMinter = JettonMaster.create(
        Address.parse(TonTokensContract[TonNetwork.Mainnet].usdt)
      );
      console.log(Address.parse(tonAddress));
      console.log(
        await jettonMinter.getJettonData(
          client.provider(
            Address.parse(TonTokensContract[TonNetwork.Mainnet].usdt),
            null
          )
        )
      );
      console.log(
        await jettonMinter.getWalletAddress(
          client.provider(
            Address.parse(TonTokensContract[TonNetwork.Mainnet].usdt),
            null
          ),
          Address.parse(tonAddress)
        )
      );
      // const jettonWallet = await jettonMinter.getWalletAddress(
      //   client.provider(
      //     Address.parse(TonTokensContract[TonNetwork.Mainnet].usdt),
      //     null
      //   ),
      //   Address.parse(tonAddress)
      // );
      //       const jettonWallet = JettonWallet.create(walletAddress);
      // const jettonWalletContract = client.open(jettonWallet);
      // const balance = await jettonWalletContract.getBalance();
      // console.log(jettonWallet);
    })();
  }, []);

  // useEffect(() => {
  //   (async () => {
  //     if (!jettonMinterContract) return;
  //     const walletAddress = await jettonMinterContract.getWalletAddress(
  //       Address.parse(tonAddress)
  //     );
  //     // Đây là lấy instance ví được tạo ra từ contract USDT theo địa chỉ ví login
  //     const jettonWallet = JettonWallet.create(walletAddress);
  //     const jettonWalletContract = client.open(jettonWallet);
  //     const balance = await jettonWalletContract.getBalance();
  //     setTokenBalance(balance);
  //   })();
  // }, [jettonMinterContract, tonAddress]);

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

      console.log("data: >>", {
        amount,
        token,
        destinationAddress,
      });

      const fmtAmount = new BigDecimal(10)
        .pow(token.decimal)
        .mul(amount)
        .toNumber();

      const tx = await connector.sendTransaction({
        validUntil: 100000,
        messages: [
          {
            // address: jettonWalletAddress.toString(), // dia chi token
            address: jettonWalletAddress.toString(), // dia chi token
            amount: toNano(1).toString(), // gas
            payload: Base64.encode(
              beginCell()
                .storeUint(JettonOpCodes.TRANSFER, 32)
                .storeUint(0, 64)
                .storeCoins(fmtAmount)
                .storeAddress(
                  Address.parse(
                    TonInteractionContract[TonNetwork.Mainnet].bridgeAdapter
                  )
                ) // to address => Bridge Adapter
                .storeAddress(Address.parse(tonAddress)) // response address
                .storeDict(Dictionary.empty())
                .storeCoins(SEND_TON_TRANFERS_CONFIG.fwdAmount)
                .storeUint(0, 1)
                .storeRef(
                  beginCell()
                    // .storeAddress(SEND_TON_TRANFERS_CONFIG.jettonMaster)
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
      console.log("This is txhash:", txHash);

      if (txHash) {
        displayToast(TToastType.TX_SUCCESSFUL, {
          customLink: `${TON_SCAN}/transaction/${txHash}`,
        });

        loadToken({ oraiAddress, tonAddress });
      }
      // setTimeout(async () => {
      //   const data = await client.traces.getTrace(txHash);
      //   console.log({ data });
      // }, 30000);
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

      console.log("data: >>", {
        amount,
        token,
        destinationAddress,
      });

      const tonBridgeClient = new TonbridgeBridgeClient(
        window.client,
        oraiAddress,
        network.CW_TON_BRIDGE
      );

      let tx;

      const msg = {
        crcSrc: ARG_BRIDGE_TO_TON.CRC_SRC,
        denom: TonTokenList.find((tk) => tk.coingeckoId === token.coingeckoId)
          .contractAddress,
        localChannelId: ARG_BRIDGE_TO_TON.CHANNEL,
        to: tonAddress,
      };
      const funds = handleSentFunds({
        denom: token.denom,
        amount,
      });

      console.log("msg", msg);

      if (!token.contractAddress) {
        console.log("258", 258);
        tx = await tonBridgeClient.bridgeToTon(msg, "auto", null, funds);
      } else {
        console.log("261", 261);
        tx = await window.client.execute(
          oraiAddress,
          token.contractAddress,
          {
            send: {
              contract: network.CW_TON_BRIDGE,
              amount: toAmount(amount).toString(),
              msg: toBinary({
                crc_src: msg.crcSrc,
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
              amount={amount}
              onChangeAmount={(val) => setAmount(val)}
              token={token}
              balance={tokenBalance}
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

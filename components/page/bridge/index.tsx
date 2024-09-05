"use client";
import { SearchIcon, SwapIcon, WarningIcon } from "@/assets/icons/action";
import { TonNetworkICon } from "@/assets/icons/network";
import { OraiIcon, OsmosisIcon } from "@/assets/icons/token";
import Loader from "@/components/commons/loader/Loader";
import ConnectButton from "@/components/layout/connectButton";
import { TON_SCAN } from "@/constants/config";
import { Environment } from "@/constants/ton";
import {
  CW_TON_BRIDGE,
  TON_ZERO_ADDRESS,
  TonInteractionContract,
} from "@/constants/contract";
import { getNetworkConfig } from "@/constants/networks";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import {
  OraichainTokenList,
  TokenType,
  TonTokenList,
} from "@/constants/tokens";
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
  IBC_WASM_CONTRACT,
  cosmosChains,
  handleSentFunds,
  toAmount,
  toDisplay,
  CosmosChainId,
  calculateTimeoutTimestamp,
  getCosmosGasPrice,
} from "@oraichain/oraidex-common";
import {
  BridgeAdapter,
  JettonMinter,
  JettonWallet,
} from "@oraichain/ton-bridge-contracts";
import { TonbridgeBridgeClient } from "@oraichain/tonbridge-contracts-sdk";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { Address, Cell, beginCell, toNano } from "@ton/core";
import { TonClient } from "@ton/ton";
import { Base64 } from "@tonconnect/protocol";
import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import InputBridge, { NetworkType } from "./components/inputBridge";
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
  MINIMUM_BRIDGE_PER_USD,
} from "./constants";
import { getMixPanelClient } from "@/libs/mixpanel";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useCoinGeckoPrices } from "@/hooks/useCoingecko";
import SelectCommon from "@/components/commons/select";
import { NetworkWithIcon } from "@/constants/chainInfo";
import {
  UniversalSwapHelper,
  buildUniversalSwapMemo,
} from "@oraichain/oraidex-universal-swap";
import { coin } from "@cosmjs/proto-signing";
import { getCosmWasmClient } from "@/libs/cosmjs";
import { GasPrice } from "@cosmjs/stargate";
import { getAddressCosmos } from "./helper";
import { ArrowDownIcon } from "@/assets/icons/arrow";

const Bridge = () => {
  const oraiAddress = useAuthOraiAddress();
  const tonAddress = useAuthTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const [txtSearch, setTxtSearch] = useState<string>();
  const tonNetwork = process.env.NEXT_PUBLIC_ENV as Environment;

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
  const [bridgeJettonWallets, setBridgeJettonWallets] = useState<string[]>();

  const [deductNativeAmount, setDeductNativeAmount] = useState(0n);
  const { data: prices } = useCoinGeckoPrices();

  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);

  let destinationAddress = oraiAddress;
  if (toNetwork.id === NetworkList.ton.id) destinationAddress = tonAddress;
  if (toNetwork.id === NetworkList["osmosis-1"].id)
    destinationAddress = getAddressCosmos(oraiAddress);

  const network = getNetworkConfig(tonNetwork);

  const { bridgeFee, tokenFee } = useGetFee({
    token,
  });

  const { handleUpdateQueryURL } = useFillNetwork({
    setFromNetwork,
    setToNetwork,
  });

  useEffect(() => {
    try {
      (async () => {
        const values = TonTokenList(tonNetwork).values();
        const endpoint = await getHttpEndpoint();
        const client = new TonClient({
          endpoint,
        });
        const bridgeAdapter = TonInteractionContract[tonNetwork].bridgeAdapter;
        const jettonWallet = await Promise.all(
          [...values].map((value) => {
            if (value.contractAddress === TON_ZERO_ADDRESS)
              return Address.parse(TON_ZERO_ADDRESS);
            const jettonMinter = client.open(
              JettonMinter.createFromAddress(
                Address.parse(value.contractAddress)
              )
            );
            return jettonMinter.getWalletAddress(Address.parse(bridgeAdapter));
          })
        );
        const allJettonWallet = jettonWallet.reduce((acc, cur, idx) => {
          acc.push(cur.toString());
          return acc;
        }, [] as string[]);
        console.log({ allJettonWallet });
        console.log({ bridgeAdapter });
        setBridgeJettonWallets(allJettonWallet);
      })();
    } catch (error) {
      console.log("error :>>", error);
    }
  }, []);

  useEffect(() => {
    if (
      toNetwork.id == NetworkList.oraichain.id &&
      token?.contractAddress === TON_ZERO_ADDRESS
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
        if (fromNetwork.id !== NetworkList.ton.id || !token) return;

        // get the decentralized RPC endpoint
        const endpoint = await getHttpEndpoint();
        const client = new TonClient({
          endpoint,
        });
        if (token?.contractAddress === TON_ZERO_ADDRESS) {
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
        const [jettonWalletAddress, bridgeJettonWalletAddress] =
          await Promise.all([
            jettonMinterContract.getWalletAddress(Address.parse(tonAddress)),
            jettonMinterContract.getWalletAddress(
              Address.parse(TonInteractionContract[tonNetwork].bridgeAdapter)
            ),
          ]);
        console.log({ bridgeJettonWalletAddress });
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
      const bridgeAdapter = TonInteractionContract[tonNetwork].bridgeAdapter;

      if (token.contractAddress === TON_ZERO_ADDRESS) {
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
      console.log({ bridgeAdapter, jettonMinter, jettonWallet, balance });
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
        if (!token.contractAddress) {
          const data = await window.client.getBalance(
            network.CW_TON_BRIDGE,
            token.denom
          );
          return {
            balance: data.amount,
          };
        }

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

  const handleCheckBalanceBridgeOfOsmosis = async (token: TokenType) => {
    try {
      if (token) {
        if (!token.contractAddress) {
          const findCosmosChain = cosmosChains.find(
            (chain) => chain.chainId === fromNetwork.id
          );
          const { client } = await getCosmWasmClient(
            { chainId: fromNetwork.id, rpc: findCosmosChain.rpc },
            {
              gasPrice: GasPrice.fromString(
                `${getCosmosGasPrice(
                  findCosmosChain.feeCurrencies[0].gasPriceStep
                )}${findCosmosChain.feeCurrencies[0].coinMinimalDenom}`
              ),
            }
          );
          const data = await client.getBalance(
            network.CW_TON_BRIDGE,
            token.denom
          );
          return {
            balance: data.amount,
          };
        }
      }
    } catch (error) {
      console.log("error :>> handleCheckBalanceBridgeOfOsmosis", error);
    }
  };

  const checkBalanceBridgeByNetwork = async (
    networkFrom: string,
    token: TokenType
  ) => {
    const handler = {
      [NetworkList.oraichain.id]: handleCheckBalanceBridgeOfTonNetwork,
      [NetworkList.ton.id]: handleCheckBalanceBridgeOfOraichain,
      [NetworkList["osmosis-1"].id]: handleCheckBalanceBridgeOfOsmosis,
    };

    const { balance } = handler[networkFrom]
      ? await handler[networkFrom](token)
      : { balance: 0 };

    return toDisplay(balance || 0, token.decimal || CW20_DECIMALS);
  };

  const validatePrice = (token: TokenType, amount: number) => {
    const usdPrice = new BigDecimal(amount || 0)
      .mul(prices?.[token?.coingeckoId] || 0)
      .toNumber();

    const minimumAmount =
      Math.ceil((MINIMUM_BRIDGE_PER_USD * amount * 100) / usdPrice) / 100;

    if (amount < minimumAmount) {
      throw Error(`Minimum bridge is ${minimumAmount} ${token.symbol}`);
    }
  };

  const handleBridgeFromTon = async () => {
    try {
      if (!oraiAddress) throw "Please connect OWallet or Kelpr!";

      if (!tonAddress) throw "Please connect Ton Wallet";

      if (!token || !amount) throw "Not valid!";

      // validatePrice(token, amount);

      setLoading(true);

      const tokenInOrai = OraichainTokenList.find(
        (tk) => tk.coingeckoId === token.coingeckoId
      );
      const balanceMax = await checkBalanceBridgeByNetwork(
        NetworkList.ton.id,
        tokenInOrai
      );

      if (
        Number(balanceMax) < Number(amount) &&
        token.contractAddress !== TON_ZERO_ADDRESS
      ) {
        setLoading(false);
        throw `The bridge contract does not have enough balance to process this bridge transaction. Wanted ${amount} ${token.symbol}, have ${balanceMax} ${token.symbol}`;
      }

      const bridgeAdapterAddress = Address.parse(
        TonInteractionContract[tonNetwork].bridgeAdapter
      );
      const fmtAmount = new BigDecimal(10).pow(token.decimal).mul(amount);
      const isNativeTon: boolean = token.contractAddress === TON_ZERO_ADDRESS;
      const toAddress: string = isNativeTon
        ? bridgeAdapterAddress.toString()
        : tokenInfo.jettonWalletAddress?.toString();
      const oraiAddressBech32 = fromBech32(oraiAddress).data;
      const gasAmount = isNativeTon
        ? fmtAmount.add(BRIDGE_TON_TO_ORAI_MINIMUM_GAS).toString()
        : BRIDGE_TON_TO_ORAI_MINIMUM_GAS.toString();
      const timeout = BigInt(Math.floor(new Date().getTime() / 1000) + 3600);

      let memo = beginCell().endCell();
      if (toNetwork.id === NetworkList["osmosis-1"].id) {
        const osmosisAddress = await window.Keplr.getKeplrAddr(toNetwork.id);
        if (!osmosisAddress) throw "Please connect OWallet or Kelpr!";

        const buildMemoSwap = buildUniversalSwapMemo(
          {
            minimumReceive: "0",
            recoveryAddr: oraiAddress,
          },
          undefined,
          undefined,
          undefined,
          {
            sourceChannel: "channel-13",
            sourcePort: "transfer",
            receiver: osmosisAddress,
            memo: "",
            recoverAddress: oraiAddress,
          },
          undefined
        );
        memo = beginCell().storeStringRefTail(buildMemoSwap).endCell();
      }

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

      const tx = await tonConnectUI.sendTransaction({
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

        const cosmosAddress = getAddressCosmos(oraiAddress);
        loadToken({ oraiAddress, cosmosAddress });
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
        tonAddress,
        oraiAddress,
        fromNetwork,
        toNetwork,
        token,
        amount,
        toToken: token.symbol,
        fromToken: token.symbol,
        priceTokenInUsd: new BigDecimal(amount)
          .mul(prices[token.coingeckoId])
          .toNumber(),
      };
      console.log("logEventTon", logEvent);
      mp.track("Bridge Ton Oraidex", logEvent);
    }
  };

  const handleBridgeFromCosmos = async () => {
    try {
      if (!oraiAddress) throw "Please connect OWallet or Kelpr!";

      if (!tonAddress) throw "Please connect Ton Wallet";

      if (!token || !amount) throw "Not valid!";

      setLoading(true);
      const isFromOsmosisToOraichain =
        fromNetwork.id === NetworkList["osmosis-1"].id &&
        toNetwork.id === NetworkList.oraichain.id;
      const isFromOraichainToOsmosis =
        fromNetwork.id === NetworkList.oraichain.id &&
        toNetwork.id === NetworkList["osmosis-1"].id;
      const isFromOsmosisToTon =
        fromNetwork.id === NetworkList["osmosis-1"].id &&
        toNetwork.id === NetworkList.ton.id;

      // Osmosis <-> Oraichain
      // Oraichain <-> Osmosis
      // Osmosis -> Ton
      if (
        isFromOsmosisToOraichain ||
        isFromOraichainToOsmosis ||
        isFromOsmosisToTon
      ) {
        const timeout = Math.floor(new Date().getTime() / 1000) + 3600;
        const fromChainId = fromNetwork.id as CosmosChainId;
        const toChainId = isFromOsmosisToTon
          ? (NetworkList.oraichain.id as CosmosChainId)
          : (toNetwork.id as CosmosChainId);

        let [fromAddress, toAddress] = await Promise.all([
          window.Keplr.getKeplrAddr(fromChainId),
          window.Keplr.getKeplrAddr(toChainId),
        ]);

        if (!fromAddress || !toAddress)
          throw "Please connect OWallet or Kelpr!";

        let memo = "";
        if (isFromOsmosisToTon) {
          toAddress = IBC_WASM_CONTRACT;

          const memoUniversal = buildUniversalSwapMemo(
            { minimumReceive: "0", recoveryAddr: oraiAddress },
            undefined,
            undefined,
            {
              contractAddress: network.CW_TON_BRIDGE,
              msg: toBinary({
                bridge_to_ton: {
                  to: tonAddress,
                  denom: TonTokenList(tonNetwork).find(
                    (tk) => tk.coingeckoId === token.coingeckoId
                  ).contractAddress,
                  timeout,
                  recovery_addr: oraiAddress,
                },
              }),
            },
            undefined,
            undefined
          );

          memo = JSON.stringify({
            wasm: {
              contract: IBC_WASM_CONTRACT,
              msg: {
                ibc_hooks_receive: {
                  func: "universal_swap",
                  orai_receiver: oraiAddress,
                  args: memoUniversal,
                },
              },
            },
          });
        }
        const ibcInfo = UniversalSwapHelper.getIbcInfo(fromChainId, toChainId);
        const msgTransfer = [
          {
            typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
            value: MsgTransfer.fromPartial({
              sourcePort: ibcInfo.source,
              sourceChannel: ibcInfo.channel,
              token: coin(
                toAmount(amount, token.decimal).toString(),
                token.denom
              ),
              sender: fromAddress,
              receiver: toAddress,
              memo,
              timeoutTimestamp: calculateTimeoutTimestamp(ibcInfo.timeout),
            }),
          },
        ];

        const findCosmosChain = cosmosChains.find(
          (chain) => chain.chainId === fromNetwork.id
        );

        const { client } = await getCosmWasmClient(
          { chainId: fromChainId, rpc: findCosmosChain.rpc },
          {
            gasPrice: GasPrice.fromString(
              `${getCosmosGasPrice(
                findCosmosChain.feeCurrencies[0].gasPriceStep
              )}${findCosmosChain.feeCurrencies[0].coinMinimalDenom}`
            ),
          }
        );
        const tx = await client.signAndBroadcast(
          fromAddress,
          msgTransfer,
          "auto"
        );

        if (tx?.transactionHash) {
          displayToast(TToastType.TX_SUCCESSFUL, {
            customLink: getTransactionUrl(
              fromNetwork.id as any,
              tx.transactionHash
            ),
          });
          const cosmosAddress = getAddressCosmos(oraiAddress);
          loadToken({ oraiAddress, cosmosAddress });
          loadAllBalanceTonToken();

          setAmount(0);
        }
        return;
      }

      // validatePrice(token, amount);

      const tokenInTon = TonTokenList(tonNetwork).find(
        (tk) => tk.coingeckoId === token.coingeckoId
      );
      const index = TonTokenList(tonNetwork).findIndex(
        (tk) => tk.coingeckoId === token.coingeckoId
      );

      const bridgeJettonWallet = bridgeJettonWallets[index];

      const balanceMax = (sentBalance || []).find(
        (b) => b.native.denom === bridgeJettonWallet
      )?.native.amount;

      const displayBalance = toDisplay(
        balanceMax,
        tokenInTon?.decimal || CW20_DECIMALS
      );

      if (displayBalance < Number(amount) && token.contractAddress !== null) {
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
        denom: bridgeJettonWallet,
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
        const cosmosAddress = getAddressCosmos(oraiAddress);
        loadToken({ oraiAddress, cosmosAddress });
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
        tonAddress,
        oraiAddress,
        fromNetwork,
        toNetwork,
        token,
        amount,
        toToken: token.symbol,
        fromToken: token.symbol,
        priceTokenInUsd: new BigDecimal(amount)
          .mul(prices[token.coingeckoId])
          .toNumber(),
      };

      console.log("logEvent", logEvent);
      mp.track("Bridge Ton Oraidex", logEvent);
    }
  };

  let isInsufficientBalance = true;
  if (fromNetwork.id === NetworkList.ton.id) {
    isInsufficientBalance =
      Number(amount) > toDisplay(amounts[token?.denom] || "0");
  }

  if (toNetwork.id === NetworkList.ton.id) {
    isInsufficientBalance =
      Number(amount) >
      toDisplay(amountsTon[token?.denom] || "0", token?.decimal);
  }

  // const isMaintained = fromNetwork.id === NetworkList.oraichain.id;
  const isMaintained = false;

  return (
    <div className={styles.container}>
      {isMaintained && (
        <div className={styles.warning}>
          <div>
            <WarningIcon />
          </div>
          <div className={styles.text}>
            <p>[NOTICE] The bridge is undergoing a 2-hour update</p>
            <p>Please refrain from transactions during this time.</p>
          </div>
        </div>
      )}

      <div className={styles.swapWrapper}>
        <div className={styles.header}>TON Bridge</div>

        <div className={styles.content}>
          <div className={styles.divider}></div>
          <div className={styles.handler}>
            <div className={styles.select}>
              <div className={styles.fromTo}>
                <h2>From</h2>
                <SelectCommon
                  open={openFrom}
                  onClose={() => setOpenFrom(false)}
                  title="Select a from network"
                  triggerElm={
                    <div
                      className={styles.networkItem}
                      onClick={() => setOpenFrom(true)}
                    >
                      <fromNetwork.Icon />
                      {fromNetwork.name}

                      <ArrowDownIcon />
                    </div>
                  }
                >
                  <div className={styles.search}>
                    <SearchIcon className={styles.searchIcon} />
                    <input
                      className={styles.searchInput}
                      type="text"
                      value={txtSearch}
                      onChange={(e) => setTxtSearch(e.target.value)}
                      placeholder="Search by from network"
                    />
                  </div>

                  <div className={styles.list}>
                    {[
                      ...cosmosChains,
                      {
                        chainId: "Ton",
                        chainName: "TON",
                      },
                    ]
                      .filter((cosmos) =>
                        [
                          NetworkList.oraichain.id,
                          NetworkList["osmosis-1"].id,
                          NetworkList.ton.id,
                        ].includes(cosmos.chainId)
                      )
                      .map((e, key) => {
                        const networkIcon = NetworkWithIcon.find(
                          (network) => network.chainId === e.chainId
                        );
                        return (
                          <div
                            className={styles.tokenItem}
                            key={`token-${key}`}
                            onClick={() => {
                              if (e.chainId === toNetwork.id) {
                                const [currentFrom, currentTo] = [
                                  fromNetwork,
                                  toNetwork,
                                ];
                                handleUpdateQueryURL([
                                  currentTo.id,
                                  currentFrom.id,
                                ]);
                                setFromNetwork(currentTo);
                                setToNetwork(currentFrom);
                              } else {
                                setFromNetwork({
                                  name: e.chainName,
                                  id: e.chainId,
                                  Icon: networkIcon.Icon,
                                });
                                handleUpdateQueryURL([e.chainId, toNetwork.id]);
                              }

                              setToken(null);
                              setOpenFrom(false);
                            }}
                          >
                            <networkIcon.Icon />
                            <div className={styles.info}>
                              <p>{e.chainName}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </SelectCommon>
              </div>
              {/* <div className={styles.fromTo}>
                <h2>From</h2>
                <div className={styles.networkItem}>
                  <fromNetwork.Icon />
                  {fromNetwork.name}
                </div>
              </div> */}
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
                <SelectCommon
                  open={openTo}
                  onClose={() => setOpenTo(false)}
                  title="Select a to network"
                  triggerElm={
                    <div
                      className={styles.networkItem}
                      onClick={() => setOpenTo(true)}
                    >
                      <toNetwork.Icon />
                      {toNetwork.name}

                      <ArrowDownIcon />
                    </div>
                  }
                >
                  <div className={styles.search}>
                    <SearchIcon className={styles.searchIcon} />
                    <input
                      className={styles.searchInput}
                      type="text"
                      value={txtSearch}
                      onChange={(e) => setTxtSearch(e.target.value)}
                      placeholder="Search by to network"
                    />
                  </div>

                  <div className={styles.list}>
                    {[
                      ...cosmosChains,
                      {
                        chainId: "Ton",
                        chainName: "TON",
                      },
                    ]
                      .filter((cosmos) =>
                        [
                          NetworkList.oraichain.id,
                          NetworkList["osmosis-1"].id,
                          NetworkList.ton.id,
                        ].includes(cosmos.chainId)
                      )
                      .map((e, key) => {
                        const networkIcon = NetworkWithIcon.find(
                          (network) => network.chainId === e.chainId
                        );
                        return (
                          <div
                            className={styles.tokenItem}
                            key={`token-${key}`}
                            onClick={() => {
                              if (e.chainId === fromNetwork.id) {
                                const [currentTo, currentFrom] = [
                                  toNetwork,
                                  fromNetwork,
                                ];
                                setFromNetwork(currentTo);
                                setToNetwork(currentFrom);
                                handleUpdateQueryURL([
                                  currentTo.id,
                                  currentFrom.id,
                                ]);
                              } else {
                                setToNetwork({
                                  name: e.chainName,
                                  id: e.chainId,
                                  Icon: networkIcon.Icon,
                                });
                                handleUpdateQueryURL([
                                  fromNetwork.id,
                                  e.chainId,
                                ]);
                              }
                              setToken(null);
                              setOpenTo(false);
                            }}
                          >
                            <networkIcon.Icon />
                            <div className={styles.info}>
                              <p>{e.chainName}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </SelectCommon>
                {/* <div className={styles.networkItem}>
                  <toNetwork.Icon />
                  {toNetwork.name}
                </div> */}
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
                networkFrom={fromNetwork.id as NetworkType}
                deductNativeAmount={deductNativeAmount}
                isMaintained={isMaintained}
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
            {fromNetwork.id === NetworkList.ton.id && (
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
                {toNetwork.id === NetworkList.ton.id ||
                fromNetwork.id === NetworkList.ton.id
                  ? numberWithCommas(bridgeFee || 0, undefined, {
                      maximumFractionDigits: CW20_DECIMALS,
                    })
                  : "0"}{" "}
                {token?.symbol}
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
                disabled={
                  loading || !token || !amount || !isInsufficientBalance
                }
                onClick={() => {
                  fromNetwork.id === NetworkList.ton.id
                    ? handleBridgeFromTon()
                    : handleBridgeFromCosmos();
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
        {/* <div className={styles.powerObridge}>
          <PowerByOBridge theme={"dark"} />
        </div> */}
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
  "osmosis-1": {
    name: "Osmosis",
    id: "osmosis-1",
    Icon: OsmosisIcon,
  },
};

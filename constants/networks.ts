import { MULTICALL_CONTRACT, ORACLE_CONTRACT,ROUTER_V2_CONTRACT } from '@oraichain/oraidex-common';
import { oraichainNetwork } from './chainInfo';

export const network = {
  ...oraichainNetwork,
  prefix: oraichainNetwork.bech32Config.bech32PrefixAccAddr,
  denom: 'orai',
  coinType: oraichainNetwork.bip44.coinType,
  fee: { gasPrice: '0.00506', amount: '1518', gas: '2000000' }, // 0.000500 ORAI
  router: ROUTER_V2_CONTRACT,
  oracle: ORACLE_CONTRACT,
  multicall: MULTICALL_CONTRACT,
  explorer: 'https://scan.orai.io'
};

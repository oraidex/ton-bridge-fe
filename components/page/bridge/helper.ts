import { token } from "@oraichain/oraidex-common/build/typechain-types/@openzeppelin/contracts";
import {
  AlloyedPool,
  OsmosisAlloyedPools,
  OsmosisTokenList,
} from "../../../constants/tokens";
import { fromBech32, toBech32 } from "@cosmjs/encoding";
import { Environment } from "@/constants/ton";

export const getAddressCosmos = (addr, prefix = "osmo") => {
  if (!addr) return undefined;
  const { data } = fromBech32(addr);
  const cosmosAddress = toBech32(prefix, data);
  return cosmosAddress;
};

export const canConvertToAlloyedToken = (
  coingeckoId: string
): AlloyedPool | undefined => {
  const hasAlloyed = OsmosisTokenList(Environment.Mainnet).find(
    (token) => token.coingeckoId == coingeckoId && token?.alloyedToken
  );
  return hasAlloyed
    ? OsmosisAlloyedPools.find((pool) => pool.alloyedToken == hasAlloyed.denom)
    : undefined;
};

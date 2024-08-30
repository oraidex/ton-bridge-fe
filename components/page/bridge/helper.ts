import { fromBech32, toBech32 } from "@cosmjs/encoding";

export const getAddressCosmos = (addr, prefix = "osmo") => {
  if (!addr) throw "Address not found";
  const { data } = fromBech32(addr);
  const cosmosAddress = toBech32(prefix, data);
  return cosmosAddress;
};

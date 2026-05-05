import { createLiveProviderContext } from "./live-common.mjs";

const { provider, summary } = createLiveProviderContext();

console.log("Tensormesh version endpoint test");
console.log(JSON.stringify(summary, null, 2));
console.log("");

const response = await provider.version.get();

console.log(
  JSON.stringify(
    {
      version: response.version,
    },
    null,
    2,
  ),
);

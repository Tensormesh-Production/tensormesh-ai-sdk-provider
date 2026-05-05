import { createLiveProviderContext } from "./live-common.mjs";

const { provider, summary } = createLiveProviderContext();

console.log("Tensormesh health endpoint test");
console.log(JSON.stringify(summary, null, 2));
console.log("");

const response = await provider.health.get();

console.log(
  JSON.stringify(
    {
      status: response.status,
    },
    null,
    2,
  ),
);

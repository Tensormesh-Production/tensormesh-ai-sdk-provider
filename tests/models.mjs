import { createLiveProviderContext } from "./live-common.mjs";

const { provider, summary } = createLiveProviderContext();

console.log("Tensormesh models endpoint test");
console.log(JSON.stringify(summary, null, 2));
console.log("");

const response = await provider.models.list();
const modelIds = Array.isArray(response.data)
  ? response.data.map((model) => model.id)
  : [];

console.log(
  JSON.stringify(
    {
      modelCount: modelIds.length,
      modelIds,
    },
    null,
    2,
  ),
);

if (!Array.isArray(response.data)) {
  throw new Error("Expected models.data to be an array.");
}

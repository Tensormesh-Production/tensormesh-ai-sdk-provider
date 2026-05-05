export const weatherPrompt =
  "What is the weather in Bangkok? Use the weather tool, then answer in one sentence.";

export const weatherToolName = "weather";
export const weatherToolDescription = "Return the weather for a city.";
export const weatherCityDescription = "City name to look up";

export function getToolChoiceForModel(modelId) {
  return isGptOssModel(modelId) ? "auto" : "required";
}

export function createWeatherToolResult({ city }) {
  return {
    city,
    condition: "sunny",
    temperatureC: 32,
  };
}

function isGptOssModel(modelId) {
  return modelId.toLowerCase().includes("gpt-oss");
}
